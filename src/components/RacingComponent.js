import React, { useState, useEffect, useRef, useMemo } from "react";
import io from "socket.io-client";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL
const socket = io(API_URL);

const RacingComponent = () => {
    const [paragraph, setParagraph] = useState("");
    const [input, setInput] = useState("");
    const [progress, setProgress] = useState(0);
    const [allProgress, setAllProgress] = useState({});
    const [raceId, setRaceId] = useState(null);
    const [raceStarted, setRaceStarted] = useState(false);

    const [startTime, setStartTime] = useState(null);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [finalSpeed, setFinalSpeed] = useState(0);
    const inputRef = useRef(input);

    const user = useMemo(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    }, []);

    const userId = user._id
    const intervalRef = useRef(null);

    const joinRace = async () => {
        try {
            const res = await axios.post(API_URL + "/race/join-race", { userId });

            const race = res.data;
            setParagraph(race.paragraph);
            setRaceId(race._id);
        } catch (error) {
            console.error("Failed to join race", error);
        }
    };

    useEffect(() => {
        joinRace();
    }, []);

    useEffect(() => {
        if (!raceId) return;

        socket.emit("joinRaceRoom", { raceId, userId });

        const handleRaceStarted = () => {
            setRaceStarted(true);
        };

        const handleUpdateProgress = (data) => {
            if (data.userId !== userId) {
                setAllProgress((prev) => ({
                    ...prev,
                    [data.userId]: { progress: data.progress, name: data.name , raceId: data.raceId},
                }));
            }
        };

        socket.on("raceStarted", handleRaceStarted);
        socket.on("updateProgress", handleUpdateProgress);

        return () => {
            socket.off("raceStarted", handleRaceStarted);
            socket.off("updateProgress", handleUpdateProgress);
        };
    }, [raceId]);

    useEffect(() => {
        if (raceStarted && progress > 0 && progress <= 100) {
            intervalRef.current = setInterval(() => {
                socket.emit("progress", {
                    raceId,
                    userId,
                    name: user.username,
                    progress,
                });
            }, 1000);
        }

        return () => clearInterval(intervalRef.current);
    }, [progress, raceStarted, raceId]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        inputRef.current = value
        setInput(value);

        if (startTime === null) {
            setStartTime(Date.now());
        }

        let correctChars = 0;
        for (let i = 0; i < value.length; i++) {
            if (value[i] === paragraph[i]) {
                correctChars++;
            } else {
                break;
            }
        }

        const totalChars = paragraph.length;
        const newProgress = Math.floor((correctChars / totalChars) * 100);
        setProgress(newProgress);
    };

    useEffect(() => {
        let timer;

        if (startTime) {
            timer = setInterval(() => {
                const currentTime = Date.now();
                const timeInMinutes = (currentTime - startTime) / (60 * 1000);
                const wordsTyped = inputRef.current.length / 5;
                const speed = Math.floor(wordsTyped / timeInMinutes);
                setCurrentSpeed(speed);
            }, 1000);

            return () => clearInterval(timer);
        }

        return () => clearInterval(timer);
    }, [startTime]);

    useEffect(() => {
        if (progress === 100 && !finalSpeed) {
            setFinalSpeed(currentSpeed)
            updateUserRaces(currentSpeed)
        }
    }, [progress])

    const updateUserRaces = async (speed) => {
        const isRace = Object.entries(allProgress).length > 0 ? 1 : 0;
        const isWon = isRace ? Object.entries(allProgress).every(([key, value]) => speed >= value.progress) : 0
        const isLost = isRace ? Object.entries(allProgress).some(([key, value]) => speed < value.progress) : 0

        const payload = {
            isRace: Number(isRace),
            racesWon: Number(isWon),
            racesLost: Number(isLost),
            speed,
            userId,
        };

        try {
            const res = await axios.post(API_URL + "/users/update", payload);

            user.racesParticipated += Number(isRace)
            user.racesWon += Number(isWon)
            user.racesLost += Number(isLost)
            user.totalRaces += 1
            user.highestTypingSpeed = Math.max(user.highestTypingSpeed, speed)
            user.avgTypingSpeed = Number(((user.avgTypingSpeed * (user.totalRaces - 1)) + speed) / user.totalRaces).toFixed(2)

            localStorage.setItem('user', JSON.stringify(user))
        } catch (error) {
            console.error("Error updating user race:", error);
        }
    };


    const renderParagraph = () => {
        return paragraph.split("").map((char, index) => {
            let className = "";

            if (index < input.length) {
                className = input[index] === char ? "text-green-600" : `text-red-600 ${char === ' ' ? 'bg-red-300' : ''}`;
            } else if (index === input.length) {
                className = "bg-yellow-200 text-black";
            }

            return (
                <span key={index} className={className}>
                    {char}
                </span>
            );
        });
    };

    const handleStartWithoutWaiting = () => {
        socket.emit("startRace", { raceId });
        setRaceStarted(true);
    };

    const StatCard = ({ emoji, label, value }) => (
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">{emoji}</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{value}</div>
        </div>
    );

    return (
        <main className="p-6 flex items-center justify-center">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 rounded-lg px-6 py-8 ring shadow-xl ring-gray-900/5">
                <div className="mt-6 p-6 font-sans max-w-3xl mx-auto">
                    {
                        finalSpeed > 0 && (
                            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white">
                                <div className="text-6xl animate-bounce mb-4">🏁🎉</div>
                                <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                                <p className="text-xl mb-4">You finished the race! 🚀</p>
                                <p className="text-2xl font-mono">
                                    Final Speed: <span className="text-green-400">{finalSpeed} WPM</span>
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-6 text-3xl hover:scale-110 transition-transform"
                                    title="Restart Race"
                                >
                                    ⟳
                                </button>
                            </div>
                        )}

                    <h2 className="text-2xl font-bold mb-4 font-mono text-gray-900 dark:text-white">
                        Hey <span className="capitalize font-semibold text-blue-600">{user.username}</span> , its time to race 🏎️🚀
                    </h2>

                    <div className="typing-speed-container">
                        <h2>Typing Speed: {finalSpeed || currentSpeed} WPM</h2>
                    </div>

                    <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6">
                        <p className="whitespace-pre-wrap text-sm text-lg font-mono text-gray-900 dark:text-white" style={{
                            fontSize: '19px', lineHeight: '2',
                            userSelect: 'none'
                        }}>
                            {renderParagraph()}
                        </p>
                    </div>

                    {raceStarted ? (
                        <textarea
                            className="w-full border p-3 rounded text-sm text-lg font-mono bg-white text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600"
                            rows="5"
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Start typing here..."
                            onPaste={(e) => e.preventDefault()}
                        />
                    ) : (
                        <p className="text-yellow-500">Waiting for other players to join...</p>
                    )}

                    {
                        !raceStarted &&
                        <div className="flex justify-center align-center">
                            <button
                                onClick={handleStartWithoutWaiting}
                                className="mt-6 sm:w-[25%] w-[80%] py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                                Start Now or Wait
                            </button>
                        </div>

                    }

                    {
                        progress > 0 &&
                        <div className="mt-6">
                            <h3 className="font-semibold mb-1">Your Progress: {progress}%</h3>
                            <div className="h-4 bg-gray-200 rounded">
                                <div
                                    className="h-4 bg-green-500 rounded"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    }

                    {
                        Object.entries(allProgress)?.length > 0 &&
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Other Racers</h3>
                            {Object.entries(allProgress).map(([id, data]) => (
                                <div key={id} className="mb-2">
                                    <span className="text-sm font-medium">{data?.name}</span>: {data?.progress}%
                                    <div className="h-2 bg-gray-300 rounded">
                                        <div
                                            className="h-2 bg-blue-500 rounded"
                                            style={{ width: `${data.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }

                    {
                        user &&
                        <div className="mt-[15%] p-4 bg-white dark:bg-gray-800 rounded  text-gray-900 dark:text-white">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <StatCard emoji="🎮" label="Practised Count" value={user.totalRaces} />
                                <StatCard emoji="🚀" label="Raced Matches" value={user.racesParticipated} />
                                <StatCard emoji="🏆" label="Races Won" value={user.racesWon} />
                                <StatCard emoji="😓" label="Races Lost" value={user.racesLost} />
                                <StatCard emoji="⚡" label="Top Speed" value={`${user.highestTypingSpeed} WPM`} />
                                <StatCard emoji="📈" label="Avg Speed" value={`${user.avgTypingSpeed} WPM`} />
                            </div>
                        </div>
                    }
                </div>
            </div>
        </main>

    );
};

export default RacingComponent;

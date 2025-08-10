import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const chatRef = useRef<HTMLInputElement>(null);
  const roomIdRef = useRef<HTMLInputElement>(null);

  const [ws, setWs] = useState<WebSocket>();
  const [joinedRooms, setJoinedRooms] = useState<string[]>([]); // multiple rooms
  const [activeRoom, setActiveRoom] = useState(""); // room you’re chatting in
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [messages, setMessage] = useState<{ role: string; message: string }[]>([]);

  const sendMessage = () => {
    const message = chatRef.current?.value || "";
    if (!message.trim() || !activeRoom) return;

    const payload = {
      type: "chat",
      payload: {
        roomId: activeRoom,
        message: message,
      },
    };

    ws?.send(JSON.stringify(payload));
    setMessage((prev) => [...prev, { role: "User", message }]);
    if (chatRef.current) chatRef.current.value = "";
  };

  const handleRoomSubmit = () => {
    const enteredRoomId = roomIdRef.current?.value.trim();
    if (!enteredRoomId) return;

    const payload = {
      type: "join",
      payload: { roomId: enteredRoomId },
    };

    ws?.send(JSON.stringify(payload));

    // Store locally
    setJoinedRooms((prev) => [...new Set([...prev, enteredRoomId])]);
    setActiveRoom(enteredRoomId);

    // Close modal
    setModalType(null);
  };

  useEffect(() => {
    const wss = new WebSocket("ws://localhost:8080");
    setWs(wss);

    wss.onmessage = (ev) => {
      setMessage((prev) => [...prev, { role: "Server", message: ev.data }]);
    };
  }, []);

  return (
    <>
      <div className="w-screen h-screen bg-black text-white flex flex-col p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black font-serif text-center flex-1">
            Welcome to ChatlyFi with AI
          </h1>
          <div className="flex gap-3">
            <button
              className="bg-transparent border border-white px-3 py-2 rounded-lg font-bold hover:bg-white hover:text-black transition"
              onClick={() => setModalType("create")}
            >
              Create Room
            </button>
            <button
              className="bg-transparent border border-white px-3 py-2 rounded-lg font-bold hover:bg-white hover:text-black transition"
              onClick={() => setModalType("join")}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Room Selector */}
        {joinedRooms.length > 0 && (
          <div className="flex gap-2 mb-3">
            {joinedRooms.map((room) => (
              <button
                key={room}
                onClick={() => setActiveRoom(room)}
                className={`px-3 py-1 rounded-lg ${
                  activeRoom === room ? "bg-purple-500" : "bg-gray-700"
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        )}

        {/* Chat Box */}
        <div className="flex-1 border border-gray-700 rounded-2xl p-4 overflow-y-auto space-y-3">
          {messages.map((mssg, index) =>
            mssg.message ? (
              <div
                key={index}
                className={`max-w-[75%] px-4 py-2 rounded-lg font-black break-words ${
                  mssg.role === "User"
                    ? "bg-purple-500 self-end ml-auto text-right"
                    : "bg-gray-500 self-start mr-auto text-left"
                }`}
              >
                {mssg.message}
              </div>
            ) : null
          )}
        </div>

        {/* Input */}
        <div className="flex items-center mt-4 gap-3">
          <input
            ref={chatRef}
            placeholder="Type something here..."
            className="flex-1 rounded-2xl px-5 py-3 border border-gray-500 outline-none font-semibold bg-black text-white focus:border-purple-500"
          />
          <button
            onClick={sendMessage}
            className="bg-white text-black font-black px-5 py-3 rounded-2xl hover:bg-black hover:border-2 hover:border-white hover:text-white transition"
          >
            Send
          </button>
        </div>

        {/* Modal */}
        {modalType && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-[90%] max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {modalType === "create" ? "Create a Room" : "Join a Room"}
              </h2>
              <input
                type="text"
                placeholder="Enter room ID..."
                className="w-full px-4 py-2 rounded-lg bg-black border border-gray-500 text-white outline-none focus:border-purple-500 mb-4"
                ref={roomIdRef}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoomSubmit}
                  className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 font-bold"
                >
                  {modalType === "create" ? "Create" : "Join"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

# Real-Time Chat App

## 🚀 Overview

The **Real-Time Chat App** is a web-based chat platform that enables users to communicate with each other in real-time. Built using modern web technologies, the app provides seamless messaging functionality with an intuitive user interface.



## 🔥 Features

- 💬 **Instant Messaging** – Send and receive messages in real-time.
- 👥 **Multiple Chat Rooms** – Create and join different chat rooms.
- 🔐 **Secure Authentication** – User login system for secure access.
- 📱 **Responsive UI** – Works smoothly on all devices.
- 📌 **Message History** – View past messages in a room.
- 🚀 **Typing Indicator** – Know when someone is typing.
- 🟢 **User Presence** – See online and offline users.
- 🔊 **Notification Alerts** – Get notified of new messages.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (for storing users & chat history)
- **Real-time Communication:** Socket.io
- **Authentication:** JWT (JSON Web Token)

## 🎮 How It Works

1. **User Authentication** – Users sign up or log in to access the chat rooms.
 
2. **Joining a Chat Room** – Users can join an existing chat room or create a new one.
  
3. **Messaging in Real-Time** – Users can send and receive messages instantly.
  
4. **Notifications & Typing Indicator** – Users get notified when someone is typing or when they receive a message.
5. **Chat History** – Users can view previously sent messages.

## 🏗️ Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/real-time-chat-app.git
   cd real-time-chat-app
   ```
2. **Install dependencies:**
   ```sh
   npm init
   npm i socket.io web-push nodemon --save-dev ejs express mongoose  bcrypt jsonwebtoken dotenv
   
   ```
3. **Setup Environment Variables:**
   Create a `.env` file and add the following:
   ```env
   URL=your_mongo_connection_string
   SECRET_KEY=your_secret_key
   ```
4. Before run  , edit the script field in package.json
5. ```sh
   script:{
     "start":"node app.js",
     "dev":"nodemon app.js"
   }
   ```
6. **Start the server:**
   ```sh
   npm run dev
   ```
7. **Access the app:** Open `http://localhost:3000` in your browser.

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to modify.

## 📩 Contact

For queries, reach out to [**vaibhavsaxena599@gmail.com**](mailto:vaibhavsaxena599@gmail.com) or create an issue in the repository.

---

Made with ❤️ by **Vaibhav Saxena** 🚀


# MongoBridge - Remote Database Interface

A professional web dashboard for managing MongoDB data remotely. Connect to your remote server or local MongoDB instance and manage your data through a beautiful, modern interface.

## Features

- 🌐 **Dual Connection Mode**: Switch between Remote Server and Local Instance
- 💾 **Real-time Data Management**: Add, view, and delete MongoDB documents
- 🔒 **Secure Bridge Architecture**: Backend API protects direct database access
- 🎨 **Modern UI**: Clean, responsive interface built with React
- ⚡ **Fast & Lightweight**: Optimized for performance

## Project Structure

```
├── backend/          # Node.js/Express API server
│   ├── server.js     # Main server file
│   ├── .env          # Environment variables (not in repo)
│   └── package.json
├── frontend/         # React web application
│   ├── src/
│   │   ├── App.jsx   # Main application component
│   │   └── index.css
│   └── package.json
└── package.json      # Root package for running both servers
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Weighing-Machine-Part-2.git
   cd Weighing-Machine-Part-2
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure Backend**
   
   Create a `.env` file in the `backend` folder:
   ```env
   MONGODB_URI=mongodb://localhost:27017/data_bridge
   PORT=5000
   ```
   
   **For Remote Server**: Replace `localhost` with your server's IP address.

### Running the Application

**Development Mode (Both servers simultaneously):**
```bash
npm run start
```

This will start:
- Backend API on `http://localhost:5000`
- Frontend UI on `http://localhost:5173`

**Run Individually:**
```bash
# Backend only
npm run backend

# Frontend only
npm run frontend
```

## Configuration

### Connecting to Remote Server

1. Open the web interface at `http://localhost:5173`
2. Click the **"Remote Server"** button at the top
3. The app will connect to the IP configured in `App.jsx` (default: `150.129.165.162`)

### Changing Remote IP

Edit `frontend/src/App.jsx`:
```javascript
const REMOTE_IP = 'YOUR_SERVER_IP_HERE';
```

## Deployment

### Backend (On Remote Server)

1. Copy the `backend` folder to your server
2. Install dependencies: `npm install`
3. Create `.env` file with your MongoDB connection
4. Run: `node server.js`
5. Ensure port 5000 is open in your firewall

### Frontend (Local or Hosted)

The frontend can run locally or be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Fetch all documents |
| POST | `/api/data` | Create new document |
| DELETE | `/api/data/:id` | Delete document by ID |

## Security Notes

- ✅ `.env` files are gitignored
- ✅ MongoDB connection strings are never exposed to frontend
- ✅ Backend acts as secure bridge between web and database
- ⚠️ For production, add authentication and HTTPS

## Technologies Used

- **Frontend**: React, Axios, Vite
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Styling**: Inline CSS (for maximum compatibility)

## License

MIT License - Feel free to use this project for your own purposes.

## Support

For issues or questions, please open an issue on GitHub.

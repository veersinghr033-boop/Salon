import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
// import UserProfile from "./pages/userProfile";

function App() {
  return (
    <>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  );
}

export default App;
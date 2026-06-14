import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes.jsx";
import { profileThunk } from "./redux/auth/authThunk";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(profileThunk());
    }
  }, [dispatch, isAuthenticated, user]);

  return <AppRoutes />;
}

export default App;

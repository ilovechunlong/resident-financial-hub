
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard as this is a management system
    navigate("/");
  }, [navigate]);

  return null;
};

export default Index;

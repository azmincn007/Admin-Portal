import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MobileHeaderComponent = ({ title, rightContent }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 md:hidden shadow-2xl">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-blue-600 rounded-full transition-transform transform hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold tracking-wide">{title}</h1>
        <div className="w-8 flex justify-end">{rightContent}</div>
      </div>
    </div>
  );
};

export default MobileHeaderComponent;
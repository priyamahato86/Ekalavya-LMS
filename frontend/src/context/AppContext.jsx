import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
//import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const navigate = useNavigate();
  // const { getToken } = useAuth()
  // const { user } = useUser()

  const [showLogin, setShowLogin] = useState(false);
  const [isEducator, setIsEducator] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // === AUTH ===
  const login = (user, token) => {
    if (!user._id || user._id.startsWith("user_")) {
      toast.error("Invalid user ID format. Login failed.");
      return;
    }
    setUserData(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setIsEducator(user.role === "educator");
  };

  const logout = () => {
    setUserData(null);
    setToken("");
    setIsEducator(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  // Fetch All Courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/course/all");

      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch UserData
  // const fetchUserData = async () => {

  //     try {

  //         if (user.publicMetadata.role === 'educator') {
  //             setIsEducator(true)
  //         }

  //         const token = await getToken();

  //         const { data } = await axios.get(backendUrl + '/api/user/data',
  //             { headers: { Authorization: `Bearer ${token}` } })

  //         if (data.success) {
  //             setUserData(data.user)
  //         } else (
  //             toast.error(data.message)
  //         )

  //     } catch (error) {
  //         toast.error(error.message)
  //     }

  // }
  const fetchUserData = async () => {
    setIsUserLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("User Data Response:", data);
      if (data.success) {
        setUserData(data.user);
        setIsEducator(data.user.role === "educator");
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUserLoading(false); // Done loading
    }
  };

  // Fetch User Enrolled Courses
  // const fetchUserEnrolledCourses = async () => {

  //     const token = await getToken();

  //     const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
  //         { headers: { Authorization: `Bearer ${token}` } })

  //     if (data.success) {
  //         setEnrolledCourses(data.enrolledCourses.reverse())
  //     } else (
  //         toast.error(data.message)
  //     )

  // }
  const fetchUserEnrolledCourses = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/enrolled-courses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to Calculate Course Chapter Time
  const calculateChapterTime = (chapter) => {
    let time = 0;

    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));

    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to Calculate Course Duration
  const calculateCourseDuration = (course) => {
    let time = 0;

    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );

    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }

    let totalRating = 0;
    course.courseRatings.forEach((rating) => {
      totalRating += rating.rating;
    });
    return Math.floor(totalRating / course.courseRatings.length);
  };

  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Fetch User's Data if User is Logged In
  // useEffect(() => {
  //     if (user) {
  //         fetchUserData()
  //         fetchUserEnrolledCourses()
  //     }
  // }, [user])
  //   useEffect(() => {
  //   if (token) {
  //     fetchUserData();
  //     fetchUserEnrolledCourses();
  //   }
  // }, [token]);
  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchUserEnrolledCourses();
    } else {
      setIsUserLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (!parsedUser._id || parsedUser._id.startsWith("user_")) {
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUserData(null);
        setToken("");
        setIsEducator(false);
        setIsUserLoading(false); // prevent spinner
        return;
      }
    }
  }, []);

  const value = {
    showLogin,
    setShowLogin,
    backendUrl,
    currency,
    navigate,
    userData,
    setUserData,
    allCourses,
    fetchAllCourses,
    enrolledCourses,
    fetchUserEnrolledCourses,
    calculateChapterTime,
    calculateCourseDuration,
    calculateRating,
    calculateNoOfLectures,
    isEducator,
    setIsEducator,
    token,
    login,
    logout,
    isUserLoading,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

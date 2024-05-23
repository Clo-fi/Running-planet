import { Route, Routes } from "react-router-dom";
import LayoutWithFooter from "./components/layout/LayoutWithFooter";
import Home from "./routes/home/Home";
import Profile from "./routes/profile/Profile";
import Login from "./routes/login/Login";
import CrewSearchPage from './routes/crew/crewSearch/CrewSearchPage';
import RunningPage from "./routes/running/RunningPage";
import RunningCompletePage from "./routes/running-complete/RunningCompletePage";
import CrewHomePage from './routes/crew/crewHome/CrewHomePage';
import CrewPostingPage from './routes/crew/crewPosting/CrewPostingPage';
import PostDetailPage from './routes/crew/postDetail/PostDetailPage';
import Setting from "./routes/setting/Setting";
import CrewTabPage from './routes/crew/CrewTabPage';
import CrewCreatePage from './routes/crew/crewCreate/CrewCreatePage';

function App() {

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />
      <Route element={<LayoutWithFooter />}>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/profile" element={<Profile />}></Route>
        <Route path='/crew' element={<CrewTabPage />} />
        <Route path='/crew/search' element={<CrewSearchPage />} />
        <Route path='/crew/create' element={<CrewCreatePage />} />
        <Route path="/" element={<Home />}/>
        <Route path="/profile" element={<Profile />} />
        <Route path='/crew-search' element={<CrewSearchPage />} />
        <Route path='/crew/:crewId' element={<CrewHomePage />} />
        <Route path='/crew/:crewId/board/write' element={<CrewPostingPage />} />
        <Route path='/crew/:crewId/board/:boardId' element={<PostDetailPage />} />
      </Route>
      <Route path="/running" element={<RunningPage />} />
      <Route path="/running-complete" element={<RunningCompletePage />} />
      <Route path="/setting" element={<Setting />} />
    </Routes>
  );
}

export default App;

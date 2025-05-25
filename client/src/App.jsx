import { Fragment } from 'react'
import './App.css'
import Login from './login/Login'
import Signup from './login/Signup'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './navbar/Navbar'
import Map from './map/Map'
import HandleDashboard from './dashboard/handleDashboard'
import { Navigate } from 'react-router-dom'
function App() {


  return (
    <Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          } />
          <Route path="/signup" element={
            <>
              <Navbar />
              <Signup />
            </>
          } />
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <HandleDashboard />
            </>
          } />
          <Route path="/map" element={
            <>
              <Navbar />
              <Map />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </Fragment>
  );
}

export default App;

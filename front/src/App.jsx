import { Fragment } from 'react'
import './App.css'
import Login from './login/Login'
import Signup from './login/signup'
import Dashboard from './dashboard/Dashboard'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './navbar/Navbar'
import Map from './map/Map'
import HandleDashboard from './dashboard/handleDashboard'
function App() {


  return (
    <Fragment>
      <BrowserRouter>

        <Routes>
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

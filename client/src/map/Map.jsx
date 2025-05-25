import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../login/IsLoggedIn';
import axios from '../Axiosapi';
import { io } from 'socket.io-client';


const socket = io(`${import.meta.env.VITE_API_URL}`);

const Map = ({ lat = 55.505, lng = -0.09 }) => {
  const navigate = useNavigate();
  const [demandData, setDemandData] = useState([]);
  const [loggedIn, setLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newDemand, setNewDemand] = useState(null);

  useEffect(() => {
    const checkLogin = () => {
      if (!isLoggedIn()) {
        setLoggedIn(false);
        navigate('/login');
      } else {
        setLoggedIn(true);
      }
    };
    checkLogin();
  }, [navigate]);

  useEffect(() => {
    if (loggedIn) {
      axios.get('/demand', {
        headers: {
            Authorization:'Bearer '+localStorage.getItem('token')
        }
    })
        .then((response) => {
          const unresolvedDemands = response.data.demands.filter(
            demand => demand.status !== 'resolved'
          );
          setDemandData(unresolvedDemands);
          console.log('Demand Data:', response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching demand data:', error);
          setIsLoading(false);
        });
    }
  }, [loggedIn]);

  useEffect(() => {
    if (isLoading) return;

    const map = L.map('map').setView([lat, lng], 13);

    if (demandData.length === 0) {
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup('No unresolved demands available.')
        .openPopup();
      return () => {
        map.remove();
      };
    }

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    demandData.forEach((demand) => {
      const [lati, lngi] = demand.location.split(',').map(coord => parseFloat(coord));
      if (lati && lngi) {
        L.marker([lati, lngi])
          .addTo(map)
          .bindPopup(`
            <div>
              <strong>Item Name:</strong> ${demand.itemname || 'N/A'}<br />
              <strong>Quantity:</strong> ${demand.quantity || 'N/A'}<br />
              <strong>Description:</strong> ${demand.description || 'No description'}<br />
              <strong>Contact:</strong> ${demand.contact || 'No contact'}<br />
              <strong>Status:</strong> ${demand.status || 'pending'}
            </div>
          `)
          .openPopup();
      }
    });

    return () => {
      map.remove();
    };
  }, [demandData, lat, lng, isLoading]);

  useEffect(() => {
    socket.on('demandCreated', (newDemand) => {
      if (newDemand.status !== 'resolved') {
        setDemandData(prev => [...prev, newDemand]);

        if (isLoading) {
          const [lati, lngi] = newDemand.location.split(',').map(coord => parseFloat(coord));
          if (lati && lngi) {
            L.marker([lati, lngi])
              .addTo(map)
              .bindPopup(`
              <div>
                <strong>Item Name:</strong> ${newDemand.itemname || 'N/A'}<br />
                <strong>Quantity:</strong> ${newDemand.quantity || 'N/A'}<br />
                <strong>Description:</strong> ${newDemand.description || 'No description'}<br />
                <strong>Contact:</strong> ${newDemand.contact || 'No contact'}<br />
                <strong>Status:</strong> ${newDemand.status || 'pending'}
              </div>
            `)
              .openPopup();
          }
        }
      }
    });
    
    return () => {
      socket.off('demandCreated');
    };
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      id="map"
      className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg shadow-lg z-0"
    />

  );
};
export default Map;

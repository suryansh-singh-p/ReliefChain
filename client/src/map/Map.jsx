import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import { useNavigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from '../login/IsLoggedIn';
import axios from '../Axiosapi';
import { io } from 'socket.io-client';
import demandCon from '../assets/demandCon.png';

const socket = io(`${import.meta.env.VITE_API_URL}`);

const Map = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [demandData, setDemandData] = useState([]);
  const [loggedIn, setLoggedIn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  const { lat, lng, demandId } = location.state || {};

  var demandIcon = L.icon({
    iconUrl: demandCon,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -10]
  });

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
            Authorization:'Bearer ' + localStorage.getItem('token')
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

    let centerLat, centerLng;
    let map;
    
    // Always prioritize the provided coordinates
    if (lat && lng) {
      centerLat = parseFloat(lat);
      centerLng = parseFloat(lng);
    } else if (demandData.length > 0) {
      // Only use latest demand's location if no coordinates provided
      const mostRecentDemand = demandData[demandData.length - 1];
      const [lati, lngi] = mostRecentDemand.location.split(',').map(coord => parseFloat(coord.trim()));
      if (lati && lngi) {
        centerLat = lati;
        centerLng = lngi;
      }
    } else {
      // Fallback to default coordinates
      centerLat = 0;
      centerLng = 0;
    }

    // Initialize map
    map = L.map('map', {
      center: [centerLat, centerLng],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // If specific coordinates are provided, show only that marker
    if (lat && lng && demandId) {
      // Find the demand by ID
      const selectedDemand = demandData.find(demand => demand._id === demandId);

      

      if (selectedDemand) {
        L.marker([centerLat, centerLng], {icon: demandIcon})
          .addTo(map)
          .bindPopup(`
            <div>
              <strong>Item Name:</strong> ${selectedDemand.itemname || 'N/A'}<br />
              <strong>Quantity:</strong> ${selectedDemand.quantity || 'N/A'}<br />
              <strong>Description:</strong> ${selectedDemand.description || 'No description'}<br />
              <strong>Contact:</strong> ${selectedDemand.contact || 'No contact'}<br />
              <strong>Status:</strong> ${selectedDemand.status || 'pending'}
            </div>
          `)
          .openPopup();
      }
    } else {
      // Show all markers if no specific coordinates provided
      demandData.forEach((demand) => {
        const [lati, lngi] = demand.location.split(',').map(coord => parseFloat(coord.trim()));
        if (lati && lngi) {
          L.marker([lati, lngi], {icon: demandIcon})
            .addTo(map)
            .bindPopup(`
              <div>
                <strong>Item Name:</strong> ${demand.itemname || 'N/A'}<br />
                <strong>Quantity:</strong> ${demand.quantity || 'N/A'}<br />
                <strong>Description:</strong> ${demand.description || 'No description'}<br />
                <strong>Contact:</strong> ${demand.contact || 'No contact'}<br />
                <strong>Status:</strong> ${demand.status || 'pending'}
              </div>
            `);
        }
      });
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [demandData, lat, lng, demandId, isLoading]);

  useEffect(() => {
    socket.on('demandCreated', (newDemand) => {
      if (newDemand.status !== 'resolved') {
        setDemandData(prev => [...prev, newDemand]);
      }
    });
    
    return () => {
      socket.off('demandCreated');
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      id="map" className='w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[800px] rounded-lg shadow-lg z-0'
    />
  );
};

export default Map;

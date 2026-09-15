import React, { useState } from 'react';
import './HomePage.css';

export const HomePage: React.FC = () => {
  return (
    <div className="container">
      <header className="header">
        <h1>🎬 Cinema E-Booking System</h1>
        <p>Browse current movies and upcoming releases</p>
      </header>

      <section>
        <h2 className="sectiontitle">Currently Running</h2>
        <div className="moviegrid">
          <div className="moviecard">
            <h3>Inception</h3>
          </div>
        </div>
      </section>
    </div>
  );
};
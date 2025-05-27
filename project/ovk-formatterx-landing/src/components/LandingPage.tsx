import React from 'react';
import './styles/landing.css';
// Place 'logo.svg' in the 'public' folder at the root of your project, then reference it by URL:
const logo = '/logo.svg';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-container">
            <img src={logo} alt="OVK FormatterX Logo" className="logo" />
            <h1>Welcome to OVK FormatterX</h1>
            <p>Your go-to solution for formatting needs.</p>
            <button className="get-started-button">Get Started</button>
        </div>
    );
};

export default LandingPage;
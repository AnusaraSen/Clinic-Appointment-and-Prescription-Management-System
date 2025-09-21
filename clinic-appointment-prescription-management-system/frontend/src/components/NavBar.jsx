import React, { useEffect, useState } from 'react';
import '../styles/NavBar.css';
import { Link } from 'react-router-dom';
// Use requested PNG icon and existing wordmark svg
import familyClinicPng from '../assets/Family Clinic (1).png';
import fallbackSvg from '../assets/family-health-logo.svg';

// Helper component to handle fallback if PNG fails to load
function BrandLogo() {
  const [src, setSrc] = useState(familyClinicPng);
  useEffect(()=> {
    // Log resolved asset path for debugging in the browser console
    // Open dev tools Network tab to ensure this URL returns 200.
    // If 404, the path or file name is wrong.
  console.log('Logo icon asset resolved to:', familyClinicPng);
  }, []);
  return (
  <div style={{height:'96px', width:'96px', overflow:'hidden', display:'block', position:'relative', marginTop:'-15px'}}>
      <img
        src={src}
        alt="Family Health Care Logo"
        height={96}
        width={96}
        style={{objectFit:'cover', height:'100%', width:'100%', display:'block'}}
        onError={(e)=> {
          if(src !== fallbackSvg){
            console.warn('Primary logo PNG failed to load, switching to fallback SVG.');
            setSrc(fallbackSvg);
          }
        }}
      />
    </div>
  );
}

function NavBar({ search, onSearchChange }) {
  // Add class to body to ensure content appears below fixed navbar
  useEffect(() => {
    document.body.classList.add('has-fixed-navbar');
    return () => {
      document.body.classList.remove('has-fixed-navbar');
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg ap-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{padding:0}}>
          <div className="brand-stack">
            <BrandLogo />
            <img src={fallbackSvg} alt="Family Health Care Wordmark" className="wordmark" />
          </div>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/link">Link</Link>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
              </a>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/action">Action</Link></li>
                <li><Link className="dropdown-item" to="/another-action">Another action</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li><Link className="dropdown-item" to="/something-else">Something else here</Link></li>
              </ul>
            </li>
            <li className="nav-item">
              <span className="nav-link disabled" aria-disabled="true">Disabled</span>
            </li>
          </ul>
          <form className="d-flex" role="search" onSubmit={(e)=> e.preventDefault()}>
            <input className="form-control me-2" type="search" placeholder="Search prescriptions, patients, medicines..." aria-label="Search" value={search} onChange={(e)=> onSearchChange(e.target.value)} />
           
            <button className="btn-search" type="submit" disabled>Search</button>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

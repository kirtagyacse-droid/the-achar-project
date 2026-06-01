export default function Footer() {
  return (
    <footer className="footer-lux">
      {/* Infinite Scrolling Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          <span>HOMEMADE IN JAIPUR • SUN-DRIED IN SMALL BATCHES • NO ARTIFICIAL PRESERVATIVES • PAN-INDIA SHIPPING • </span>
          <span>HOMEMADE IN JAIPUR • SUN-DRIED IN SMALL BATCHES • NO ARTIFICIAL PRESERVATIVES • PAN-INDIA SHIPPING • </span>
        </div>
      </div>

      <div className="container">
        <div className="footer-content-lux">
          <div className="footer-brand-section">
            <h3 className="footer-logo-lux">THE ACHAR PROJECT</h3>
            <p className="footer-desc-lux">
              Bringing Jaipur's authentic, hand-ground, and sun-matured pickles straight to your dining table. Made with pure mustard oil and generational recipes.
            </p>
          </div>
          
          <div className="footer-links-section">
            <h4 className="footer-heading-lux">Explore</h4>
            <ul className="footer-links-list">
              <li><a href="/">Home</a></li>
              <li><a href="/products">Shop All Pickles</a></li>
              <li><a href="/cart">Your Shopping Cart</a></li>
            </ul>
          </div>
          
          <div className="footer-contact-section">
            <h4 className="footer-heading-lux">Contact</h4>
            <p className="footer-contact-item">C-Scheme, Jaipur, Rajasthan 302001</p>
            <p className="footer-contact-item">Phone: +91 98290 12345 (Dummy)</p>
            <p className="footer-contact-item">Email: hello@theacharproject.com</p>
          </div>
        </div>
        
        <div className="footer-bottom-lux">
          <p>&copy; {new Date().getFullYear()} The Achar Project. Handcrafted with love.</p>
          <p className="footer-disclaimer">Artisanal e-commerce MVP concept.</p>
        </div>
      </div>
    </footer>
  );
}


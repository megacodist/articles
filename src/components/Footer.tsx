import { FaGithub, FaInstagram, FaLinkedin, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";
import ftrStyles from "./Footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={ftrStyles.footer}>
      <div className={ftrStyles.ftrContainer}>

        {/* Item 2: Social Icons */}
        <div className={ftrStyles.copyright}>
          &copy; {currentYear} Megacodist. See{" "}
          <a href="/license" className="link link-primary">License</a>.
        </div>
        
        {/* Item 3: Social Icons */}
        <div className={ftrStyles.socialIcons}>
          <div className="tooltip tooltip-top" data-tip="LinkedIn">
            <a href="#" className="m3-icon-btn hover:text-blue-500" aria-label="LinkedIn">
              <FaLinkedin className={ftrStyles.ftrIcon} />
            </a>
          </div>
          <div className="tooltip tooltip-top" data-tip="GitHub">
            <a href="#" className="m3-icon-btn hover:text-gray-400" aria-label="GitHub">
              <FaGithub className={ftrStyles.ftrIcon} />
            </a>
          </div>
          <div className="tooltip tooltip-top" data-tip="X (Twitter)">
            <a href="#" className="m3-icon-btn hover:text-white" aria-label="X (Twitter)">
              <FaXTwitter className={ftrStyles.ftrIcon} />
            </a>
          </div>
          <div className="tooltip tooltip-top" data-tip="Telegram">
            <a href="#" className="m3-icon-btn hover:text-blue-400" aria-label="Telegram">
              <FaTelegram className={ftrStyles.ftrIcon} />
            </a>
          </div>
          <div className="tooltip tooltip-top" data-tip="WhatsApp">
            <a href="#" className="m3-icon-btn hover:text-green-500" aria-label="WhatsApp">
              <FaWhatsapp className={ftrStyles.ftrIcon} />
            </a>
          </div>
          <div className="tooltip tooltip-top" data-tip="Instagram">
            <a href="#" className="m3-icon-btn hover:text-pink-500" aria-label="Instagram">
              <FaInstagram className={ftrStyles.ftrIcon} />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

interface CookieBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
  onLearnMore?: () => void;
  className?: string;
  showLearnMore?: boolean;
  learnMoreUrl?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

const CookieBanner: React.FC<CookieBannerProps> = ({
  onAccept,
  onReject,
  onLearnMore,
  className = '',
  showLearnMore = true,
  learnMoreUrl = '/privacy',
  privacyPolicyUrl = '/privacy',
  termsOfServiceUrl = '/terms'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookieConsent = localStorage.getItem('velotax-cookie-consent');
    if (!cookieConsent) {
      // Mostrar banner após um pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('velotax-cookie-consent', 'accepted');
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onAccept?.();
    }, 300);
  };

  const handleReject = () => {
    localStorage.setItem('velotax-cookie-consent', 'rejected');
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onReject?.();
    }, 300);
  };

  const handleLearnMore = () => {
    onLearnMore?.();
    if (learnMoreUrl) {
      window.open(learnMoreUrl, '_blank');
    }
  };

  if (!isVisible) return null;

  const bannerClasses = [
    'velotax-cookie-banner',
    isAnimating ? 'velotax-cookie-banner--visible' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={bannerClasses}>
      <div className="velotax-cookie-banner__content">
        <div className="velotax-cookie-banner__header">
          <h2 className="velotax-cookie-banner__title">
            Cookies
          </h2>
          <span 
            role="img" 
            aria-label="cookie" 
            className="velotax-cookie-banner__icon"
          >
            🍪
          </span>
        </div>
        
        <p className="velotax-cookie-banner__description">
          Utilizamos cookies de terceiros para proporcionar a melhor experiência em nosso site. 
          Saiba mais em nossa{' '}
          <a 
            href={privacyPolicyUrl} 
            className="velotax-cookie-banner__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Política de Privacidade
          </a>.
        </p>
        
        <div className="velotax-cookie-banner__actions">
          <button
            type="button"
            className="velotax-cookie-banner__button velotax-cookie-banner__button--secondary"
            onClick={handleReject}
          >
            Não, obrigado
          </button>
          <button
            type="button"
            className="velotax-cookie-banner__button velotax-cookie-banner__button--primary"
            onClick={handleAccept}
          >
            Aceitar todos
          </button>
        </div>
        
        {showLearnMore && (
          <div className="velotax-cookie-banner__learn-more">
            <button
              type="button"
              className="velotax-cookie-banner__learn-more-button"
              onClick={handleLearnMore}
            >
              <i className="fas fa-info-circle"></i>
              Saiba mais sobre cookies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;




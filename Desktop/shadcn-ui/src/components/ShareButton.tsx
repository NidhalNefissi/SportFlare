import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Instagram, Twitter, MessageSquare, Link as LinkIcon } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function ShareButton({
  url,
  title,
  description = '',
  className = '',
  variant = "outline",
  size = "icon",
  icon,
  onClick,
}: ShareButtonProps) {
  console.log('ShareButton rendered with props:', { url, title, variant, size });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Encode the URL and text for sharing
  const encodedUrl = encodeURIComponent(url);
  const text = description ? `${title} - ${description}` : title;
  const encodedText = encodeURIComponent(text);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sharing functions
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      'facebook-share-dialog',
      'width=626,height=436');
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      'twitter-share-dialog',
      'width=550,height=420');
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      'whatsapp-share-dialog',
      'width=550,height=420');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't support direct sharing of links, so we'll open the web version
    window.open(
      `https://www.instagram.com/?url=${encodedUrl}`,
      'instagram-share-dialog',
      'width=550,height=550');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Use Web Share API if available (for mobile devices)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy link if Web Share API is not supported
      copyToClipboard();
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    console.log('toggleDropdown called, current isOpen:', !isOpen, 'from event:', e.type);
    e.stopPropagation();
    e.preventDefault();
    console.log('Setting isOpen to:', !isOpen);
    setIsOpen(prev => !prev);
  };

  const shareOnPlatform = (platform: string) => {
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'instagram':
        window.open(`https://www.instagram.com/?url=${encodedUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
        break;
    }
    setIsOpen(false);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('handleButtonClick triggered');
    toggleDropdown(e);
    if (onClick) {
      console.log('Calling onClick handler');
      onClick(e);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button 
        variant={variant}
        size={size}
        className={`relative z-10 ${className}`}
        onClick={handleButtonClick}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            setIsOpen(false);
          }
        }}
        aria-label="Share"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {icon || <Share2 className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => {
          console.log('Backdrop clicked');
          setIsOpen(false);
        }}></div>
      )}
      {isOpen && (
        <div 
          className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="menu-button"
          tabIndex={-1}
        >
          <div className="py-1" role="none">
            {navigator.share ? (
              <button
                onClick={() => {
                  navigator.share({
                    title,
                    text: description,
                    url,
                  }).catch(console.error);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigator.share({
                      title,
                      text: description,
                      url,
                    }).catch(console.error);
                    setIsOpen(false);
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share via...
              </button>
            ) : (
              <>
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                >
                  <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                  Facebook
                </button>
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                >
                  <Twitter className="mr-2 h-4 w-4 text-blue-400" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                >
                  <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
                  WhatsApp
                </button>
                <button
                  onClick={() => shareOnPlatform('instagram')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                  role="menuitem"
                >
                  <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                  Instagram
                </button>
              </>
            )}
            <button
              onClick={() => shareOnPlatform('copy')}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  shareOnPlatform('copy');
                }
              }}
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Copy link
            </button>
          </div>
        </div>
      )}
    </div>

  );
}

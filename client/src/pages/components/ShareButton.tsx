import React, { useState } from 'react';
import { FiSend, FiCopy } from 'react-icons/fi';
import facebookIcon from "../../images/facebook.svg";
import twitterIcon from "../../images/twitter.svg";
import linkIcon from "../../images/link.svg";

const ShareButton: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleShare = () => {
    setShowModal((prev) => !prev);
  };

  const handleCopyLink = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        alert('คัดลอกลิงค์สู่คลิปบอร์ดแล้ว')
      })
      .catch((error) => {
        console.error('Error copying link:', error);
        alert('คัดลอกลิงค์ล้มเหลว`');
      });
  };

  const handleShareToSocialMedia = (socialMedia: string) => {
    let shareUrl = window.location.href;
    
    switch (socialMedia) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`);
        break;
      default:
        console.error('Invalid social media platform:', socialMedia);
        break;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center justify-center rounded-full focus:outline-none hover:bg-gray-300"
      >
        <FiSend className="h-5 w-5" />
      </button>
      {showModal && (
        <div className="flex absolute top-0 left-full ml-2 w-[90px] h-[45px] bg-white border border-gray-300 rounded-lg shadow-lg p-2 gap-2">
          <a href="" onClick={handleCopyLink} className="block mb-2">
            <img alt="linkIcon" src={linkIcon} width="30" height="30" />
          </a>
          {/* <a href="" onClick={() => handleShareToSocialMedia('facebook')} className="block mb-2">
            <img alt="Facebook" src={facebookIcon} width="30" height="30" />
          </a> */}
          <a href="" onClick={() => handleShareToSocialMedia('twitter')} className="block mb-2">
            <img alt="Twitter" src={twitterIcon} width="30" height="30" />
          </a>
        </div>
      )}
    </div>
  );
};

export default ShareButton;

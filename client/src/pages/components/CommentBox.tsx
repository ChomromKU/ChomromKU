import React from "react";

interface CommentProps {
  name: string;
  message: string;
  createdAt: Date | string;
  isYou: boolean;
  firstChar: string;
  isLast: boolean;
}

const CommentBox: React.FC<CommentProps> = ({ name, message, createdAt, isYou, firstChar, isLast }) => {
  // Function to format date and time
  const formatDateTime = (dateTime: Date): string => {
    return `${dateTime.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}`;
    // เวลา ${dateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
  };

  let formattedDate: string;

  if (createdAt instanceof Date) {
    formattedDate = formatDateTime(createdAt);
  } else if (typeof createdAt === 'string') {
    const dateObj = new Date(createdAt);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = formatDateTime(dateObj);
    } else {
      formattedDate = "Invalid Date";
    }
  } else {
    formattedDate = "ไม่ระบุเวลา";
  }

  return (
    <div className={`w-full flex flex-col gap-[15px] ${!isLast && 'border-b pb-[15px]'} `}>
      <div className="flex-1 flex items-center justify-between">
        <div className="flex gap-[10px] items-center">
          <div className="rounded-full p-4 h-6 w-6 flex items-center justify-center bg-[#006664] text-white">
            {firstChar}
          </div>
          <div>{isYou ? "คุณ" : name}</div>
        </div>
        <div className="font-light text-[12px]">{formattedDate}</div>
      </div>
      <p className="font-light">{message}</p>
    </div>
  );
};

export default CommentBox;

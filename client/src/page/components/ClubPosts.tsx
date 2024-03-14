// import Link from 'next/link';
import { Link } from "react-router-dom";
import News from "./News";
import { useEffect, useState } from "react";
import { Like, PostType } from "../../types/post";
import { Post } from "../../types/post";
import plusIcon from '../../images/plus-icon.svg'


interface ClubPostsProps {
  posts: Post[];
  clubId: number;
}

export default function ClubPosts({ posts, clubId }: ClubPostsProps) {
  const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);

  const handleButtonClick = (type: PostType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes((prevSelectedTypes) => prevSelectedTypes.filter((selectedType) => selectedType !== type));
    } else {
      setSelectedTypes((prevSelectedTypes) => [...prevSelectedTypes, type]);
    }
  };

  const filteredPosts = posts.filter((post) => selectedTypes.includes(post.type));

  return (
    <>
      <div className="flex gap-[5px]">
        <button
          onClick={() => handleButtonClick(PostType.NORMAL_POST)}
          className={`px-[15px] py-[4px] w-min h-fit whitespace-nowrap border border-1 rounded-[20px] ${
            selectedTypes.includes(PostType.NORMAL_POST)
              ? "bg-[#28C3D7] border-[#28C3D7] text-white"
              : "border-[#28C3D7] text-[#28C3D7]"
          }`}
        >
          โพสต์ทั่วไป
        </button>
        <button
          onClick={() => handleButtonClick(PostType.NEWS)}
          className={`px-[15px] py-[4px] w-min h-fit whitespace-nowrap border border-1 rounded-[20px] ${
            selectedTypes.includes(PostType.NEWS)
              ? "bg-[#03A96B] border-[#03A96B] text-white"
              : "border-[#03A96B] text-[#03A96B]"
          }`}
        >
          news
        </button>
        <button
          onClick={() => handleButtonClick(PostType.QA)}
          className={`px-[15px] py-[4px] w-min h-fit whitespace-nowrap border border-1 rounded-[20px] ${
            selectedTypes.includes(PostType.QA)
              ? "bg-[#F2914B] border-[#F2914B] text-white"
              : "border-[#F2914B] text-[#F2914B]"
          }`}
        >
          Q&A
        </button>
      </div>
      {selectedTypes.length === 0
        ? // If selectedTypes is empty, show all posts
          posts.map((p) => (
            <div key={p.id}>
              <News post={p} key={p.id} />
            </div>
          ))
        : // If selectedTypes is not empty, show filtered posts
          filteredPosts.map((p) => (
            <div key={p.id}>
              <News post={p} key={p.id} />
            </div>
          ))}
      {filteredPosts.length === 0 && selectedTypes.length !== 0 && <p>ไม่พบข้อมูล</p>}
      <Link to={`/clubs/${clubId}/posts/new`} className="fixed bottom-[24px] right-[24px] z-50">
        <img alt="line" src={plusIcon} width="64" height="64" />
      </Link>
    </>
  );
}

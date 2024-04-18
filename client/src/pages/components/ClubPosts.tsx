import { Link } from "react-router-dom";
import News from "./NewsPost";
import NewsEvent from "./NewsEvent";
import { useEffect, useState } from "react";
import { Events, PostType } from "../../types/post";
import { Post } from "../../types/post";
import plusIcon from '../../images/plus-icon.svg'
import {getPostTypeEnumValue} from "../../lib/post";

interface ClubPostsProps {
  posts: Post[];
  events: Events[];
  clubId: number;
  clubLabel: string
}

export default function ClubPosts({ posts, events,clubId, clubLabel }: ClubPostsProps) {
  const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);
  const [filteredData, setFilteredData] = useState<(Post | Events)[]>([]);
  const [combinedData, setCombinedData] = useState<(Post | Events)[]>([]);

  useEffect(() => {
    if(selectedTypes.length === 0 && combinedData.length === 0){
      const combinedData = [...events, ...posts];
      setCombinedData(combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else if(selectedTypes.length !== 0) {
        const newData = combinedData.filter((item) => {
          const postType = getPostTypeEnumValue((item as Post).type || 'EVENT');
          return postType !== undefined && selectedTypes.includes(postType);
        })
        setFilteredData(newData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    ;
  }, [selectedTypes]);

  const handleButtonClick = (type: PostType) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes((prevSelectedTypes) => prevSelectedTypes.filter((selectedType) => selectedType !== type));
    } else {
      setSelectedTypes((prevSelectedTypes) => [...prevSelectedTypes, type]);
    }
  };

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
        <button
          onClick={() => handleButtonClick(PostType.EVENT)}
          className={`px-[15px] py-[4px] w-min h-fit whitespace-nowrap border border-1 rounded-[20px] ${
            selectedTypes.includes(PostType.EVENT)
              ? "bg-[#F24B4B] border-[#F24B4B] text-white"
              : "border-[#F24B4B] text-[#F24B4B]"
          }`}
        >
          event
        </button>
      </div>
      {selectedTypes.length === 0
        ?
          combinedData.map((item) => (
            <div key={`${item.id}-${item.title}`}>
              {item.hasOwnProperty("type") ? <News post={item as Post} key={`${item.id}-${item.title}`} /> 
              : 
              <NewsEvent event={item as Events} clubLabel={clubLabel} key={`${item.id}-${item.title}`} />}
            </div>
          ))
        :
          filteredData.map((item) => (
            <div key={`${item.id}-${item.title}`}>
              {item.hasOwnProperty("type") ? <News post={item as Post} key={`${item.id}-${item.title}`} /> 
              : 
              <NewsEvent event={item as Events} clubLabel={clubLabel} key={`${item.id}-${item.title}`} />}
            </div>
          ))}
      {filteredData.length === 0 && selectedTypes.length !== 0 && <p>ไม่พบข้อมูล</p>}
      <Link data-testid="create-post-button"to={`/clubs/${clubId}/posts/new`} className="fixed bottom-[24px] right-[24px] z-50">
        <img alt="line" src={plusIcon} width="64" height="64" />
      </Link>
    </>
  );
}

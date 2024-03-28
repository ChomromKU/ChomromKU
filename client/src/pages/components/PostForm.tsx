import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ClubMember } from '../../types/club';
import PostSelector from './PostSelector';
import { Fragment, useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { PostFormType } from "../../types/post";
import { useNavigate } from 'react-router-dom';
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, createEventSchema } from "../../lib/validator"
import { Group } from '@mantine/core';
import { DatePickerInput, TimeInput } from 'react-hook-form-mantine';
import { useAuth } from './../../hooks/useAuth';
import close from "../../images/close.svg";
import { PostType } from '../../types/post';

// // import { useS3Upload } from 'next-s3-upload';

// const postFormSchema = z
// 	.object({
// 		...createEventSchema.partial().shape,
// 		...createPostSchema.partial().shape,
// 	})
// 	.omit({ clubId: true });

const postFormSchema = (postType: PostFormType): ZodType<any, any, any> => {
  if (postType === 'event') {
    const eventSchema = createEventSchema.partial();
    return eventSchema.omit({ clubId: true });
  } else {
    const postSchema = createPostSchema.partial();
    return postSchema.omit({ clubId: true });
  }
};

type PostForm = z.infer<ReturnType<typeof postFormSchema>>;

export default function PostForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostFormType>('normal_post');
  const [member, setMembers] = useState<ClubMember>();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PostForm>({ resolver: zodResolver(postFormSchema(postType)) });
  const [image, setImage] = useState<{ name: string; url: string }>({
    name: '',
    url: ''
  });
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
      if (response.status === 200) {
        setMembers(response.data);
        console.log(member)
      } else {
        console.error('Failed to fetch members');
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/clubs/${id}/members`);
        if (response.status === 200) {
          const member = response.data.find((member: ClubMember ) => member.user.stdId === user?.stdId);
          if(member) {
            setMembers(member);
          } else {
            fetchCurrentUser()
          }
        } else {
          console.error('Failed to fetch members');
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };
    fetchMembers();
  }, []);

const onSubmit: SubmitHandler<PostForm> = async (data) => {
  // if (!image.url) {
  //   alert("กรุณาอัพโหลดรูปภาพ");
  //   return;
  // }
  try {
    if (postType === 'event') {
      await axios.post(`http://localhost:3001/events`, {
        ...data,
        clubId: id,
        imageUrl: image.url || "",
        approved: member?.role === 'PRESIDENT' || member?.role === 'VICE_PRESIDENT' || member?.role === 'ADMIN',
        ownerId: member?.user.id,
      });
    } else {
      await axios.post(`http://localhost:3001/posts`, {
        ...data,
        clubId: id,
        imageUrl: image.url || "",
        type: postType.toUpperCase(),
        approved: member?.role === 'PRESIDENT' || member?.role === 'VICE_PRESIDENT' || member?.role === 'ADMIN',
        ownerId: member?.user.id,
      });
    }
    navigate(`/clubs/${id}`);
  } catch (error) {
    console.error(error);
  }
};

  function onPostTypeChange(value: PostFormType) {
    setPostType(value);
  }

//   async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
//     const files = event.target.files;
//     if (!files) return;
//     if (files.length < 1) return;
//     let file = files[0];

//     const res = await uploadToS3(file);
//     setImage({
//       name: 'อัพโหลดภาพสำเร็จ',
//       url: res.url
//     });
//   }

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-[10px] items-center">
          <h1 className="text-2xl font-bold">สร้างโพสต์ใหม่</h1>
          <div className="w-fit">
            <PostSelector role={ member? member.role : null} value={postType} onChange={onPostTypeChange} />
          </div>
        </div>
        <Link to={`/clubs/${id}`} className='h-fit'>
          <img src={close} alt="close" />
        </Link>
      </div>

      <form id="hook-form" onSubmit={handleSubmit(onSubmit)} className="my-3 flex flex-col justify-between">
        <div className="flex flex-col">
          <input
            type="text"
            placeholder="หัวข้อ"
            {...register('title')}
            className="text-2xl font-bold w-full focus:outline-none"
          />
          <textarea
            cols={30}
            rows={10}
            placeholder="เนื้อหา"
            {...register('content')}
            className="w-full my-2 focus:outline-none"
          />
          {postType === 'event' && (
            <div className="text-sm absolute bottom-[58px]">
              <Fragment>
                <Group className="pb-1">
                  วันเริ่มต้นและสิ้นสุด:
                  <DatePickerInput control={control} name={'startDate'} placeholder="วันเริ่มต้น" variant="unstyled" />
                  -
                  <DatePickerInput
                    control={control}
                    name={'endDate'}
                    placeholder="วันสิ้นสุด"
                    style={{ fontFamily: `'__Prompt_2d0d9b', '__Prompt_Fallback_2d0d9b'` }}
                    variant="unstyled"
                  />
                </Group>
                <Group className="pb-1">
                  ช่วงเวลา:
                  <TimeInput control={control} name={'startTime'} variant="unstyled" /> -
                  <TimeInput control={control} name={'endTime'} variant="unstyled" />
                </Group>
                <Group className="pb-1">
                  สถานที่จัดกิจกรรม:
                  <input
                    type="text"
                    placeholder="สถานที่จัดงาน"
                    {...register('location')}
                    className="focus:outline-none"
                  />
                </Group>
              </Fragment>
            </div>
          )}
        </div>
        <div className="flex items-center mt-2 absolute bottom-[16px] w-[calc(100%-48px)]">
          <label htmlFor="file-upload" className="custom-file-upload">
            {image.name === '' ? 'เพิ่มรูปภาพ' : 'อัพโหลดภาพสำเร็จ'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg, image/png"
            // onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="submit" 
            form="hook-form"  
            // onClick={()=>console.log('sending log')}
            className="bg-inherit text-[#006664] border border-[#006664] px-4 py-1 rounded-full ml-auto"
          >
            สร้างโพสต์
          </button>
        </div>
      </form>
    </div>
  );
}
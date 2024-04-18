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

//TODO: Implement S3 Upload

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
  // const [image, setImage] = useState<{ name: string; url: string }>({
  //   name: '',
  //   url: ''
  // });
  const [file, setFile] = useState<File>();
  
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
            await fetchCurrentUser()
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
  try {
    // Fetch the current user's Member record
    let memberId = member?.id;
    if (!memberId) {
      // If member is not found by clubId, fetch it by stdId
      const response = await axios.get(`http://localhost:3001/users/${user?.stdId}`);
      if (response.status === 200) {
        memberId = response.data?.member?.id;
      } else {
        console.error('Failed to fetch member');
        return;
      }
    }

    // Create the event post
    // const postData = {
    //   ...data,
    //   clubId: id,
    //   imageUrl: file || "",
    //   approved: member?.role === 'PRESIDENT' || member?.role === 'VICE_PRESIDENT' || member?.role === 'ADMIN',
    //   ownerId: memberId,
    // };

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('imageUrl', file || ''); // Append file data here
    formData.append('approved', member?.role === 'PRESIDENT' || member?.role === 'VICE_PRESIDENT' || member?.role === 'ADMIN' ? 'true' : 'false');
    formData.append('ownerId', memberId !== undefined ? memberId.toString() : '');
    formData.append('clubId', id !== undefined ? id.toString() : '');

    if (postType !== 'event') {
      formData.append('type', postType.toUpperCase())
    }

    console.log('formData', formData);

    if (postType === 'event') {
      formData.append('location', data.location);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('startTime', data.startTime);
      formData.append('endTime', data.endTime);
      await axios.post(`http://localhost:3001/events`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Set the Content-Type to multipart/form-data
        }
      });
    } else {
      await axios.post(`http://localhost:3001/posts`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Set the Content-Type to multipart/form-data
        }
      });
    }
    navigate(`/clubs/${id}`);
  } catch (error) {
    console.error('Error creating post:', error);
  }
};


  function onPostTypeChange(value: PostFormType) {
    setPostType(value);
  }

  // async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    // const files = event.target.files;
    // if (!files) return;
    // if (files.length < 1) return;
    // let file = files[0];

  //   const res = await uploadToS3(file);
  //   setImage({
  //     name: 'อัพโหลดภาพสำเร็จ',
  //     url: res.url
  //   });
  // }
  const fileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return;
    if (files.length < 1) return;
    let file = files[0];

    console.log('files', files);
    console.log(files[0]);

		setFile(file)
	}


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
              {/* <Fragment> */}
                {/* <Group className="pb-1"> */}
                  วันเริ่มต้นและสิ้นสุด: 
                  <DatePickerInput 
                  control={control} 
                  name={'startDate'} 
                  placeholder="เลือกวันเริ่มต้น" 
                  variant="unstyled"
                  styles={{
                    monthThead: {
                      backgroundColor: "#28C3D7",
                      height: '36px',
                      width: '36px',
                      border: "1px solid #F2F2F2",
                      paddingBottom: '10px !important',
                      color: "white",
                    },
                  }}
                  />
                  <DatePickerInput
                    control={control}
                    name={'endDate'}
                    placeholder="เลือกวันสิ้นสุด"
                    variant="unstyled"
                    styles={{
                      monthThead: {
                        backgroundColor: "#28C3D7",
                        height: '36px',
                        width: '36px',
                        border: "1px solid #F2F2F2",
                        paddingBottom: '10px !important',
                        color: "white",
                      },
                    }}
                  />
                {/* </Group> */}
                <Group className="pb-1">
                  ช่วงเวลา:
                  <TimeInput control={control} name={'startTime'} variant="unstyled" /> ถึง
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
              {/* </Fragment> */}
            </div>
          )}
        </div>
        <div className="flex items-center mt-2 absolute bottom-[16px] w-[calc(100%-48px)]">
          <label htmlFor="file-upload" className="custom-file-upload">
            {file !== undefined ? 'อัพโหลดภาพสำเร็จ' : 'เพิ่มรูปภาพ'}
          </label>
          <input
            id="file-upload"
            name="imageUrl"
            type="file"
            accept="image/jpeg, image/png"
            onChange={fileSelected} // Ensure that this is properly bound
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
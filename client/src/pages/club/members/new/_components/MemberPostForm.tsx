import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm ,SubmitHandler, FieldValues } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DynamicSelect } from "../../../../components/DynamicSelect";

import closeIcon from '../../../../../images/close.svg'
// import { useAuth } from "../../../../../hooks/useAuth";

const postFormSchema = z.object({
	year: z.string().min(1),
	faculty: z.string().min(1),
	department: z.string().min(1),
	email: z.string().min(1),
	phone: z.string().min(1),
	reason: z.string().min(1),
  });
  
  type PostForm = z.infer<typeof postFormSchema>;
  
  type MemberPostFormProps = {
	id: string;
	userId: string;
  };
  
  interface Year {
	id: string;
	label: string;
	value: string;
  }
  
  const years: Year[] = [
	{ id: '1', label: 'ชั้นปีที่ 1', value: '1' },
	{ id: '2', label: 'ชั้นปีที่ 2', value: '2' },
	{ id: '3', label: 'ชั้นปีที่ 3', value: '3' },
	{ id: '4', label: 'ชั้นปีที่ 4', value: '4' },
	{ id: '5', label: 'ชั้นปีที่อื่นๆ', value: '5' }
  ];
  
  export default function MemberPostForm({ id, userId }: MemberPostFormProps) {
	  const navigate = useNavigate();
	  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PostForm>();
	  const [opened, { open, close }] = useDisclosure(false);
	  const [selectedProductId, setSelectedProductId] = useState('');
	  const [selectedProduct, setSelectedProduct] = useState<Year | null>(null);
	  const [memberRequestFormData, setMemberRequestFormData] = useState()
	  const [sending, setSending] = useState<boolean>(false)
	  const [successModalOpened, setSuccessModalOpened] = useState(false);
  
	  const openSuccessModal = () => {
		  setSuccessModalOpened(true);
	  };
	  const closeSuccessModal = () => {
		  setSuccessModalOpened(false);
	  };
  
		useEffect(() => {
	  const fetchMemberRequestForm = async () => {
		  try {
			  const { data } = await axios.get(`http://localhost:3001/clubs/${id}/user/${userId}/applyForm`);
			  if(data) {
				  setMemberRequestFormData(data)
				  console.log(data);
			  }
		  } catch (error) {
			  console.error('Error fetching clubs:', error);
		  }
	  };
	  fetchMemberRequestForm();
	  }, [id]);
  
	  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
		  try {
			  if(data.year && data.faculty && data.department && data.email && data.phone && data.reason) {
				  console.log('sending');
				  
				  setSending(true)
				  await axios.put(`http://localhost:3001/clubs/${id}/user/${userId}/applyForm`, data);
				  close()
				  openSuccessModal();
				  setTimeout(() => {
					  setSending(false)
					  navigate(`/clubs/${id}`)
				  }, 3000);
			  } else {
				  console.log('Missing some fields')
			  }
		  } catch (error) {
		  console.error(error);
		  }
	  };
  
	  return (
		  <div className="p-[24px]">
			  <div className="flex justify-between items-center mb-[20px]">
				  <div className="flex items-center">
				  <h1 className="text-2xl font-bold">ใบสมัครเข้าสมาชิกชมรม</h1>
				  </div>
				  <Link to={`/clubs/${id}`}>
				  <img src={closeIcon} alt="close" width={12} height={12} />
				  </Link>
			  </div>
			  {memberRequestFormData ? 
				  <p>
					  รออนุมัติ
				  </p>
					  :
				  <>
					  <form id="hook-form" onSubmit={handleSubmit(onSubmit)} className="my-3 flex flex-col justify-between">
						  <div className="flex flex-col gap-[20px]">
							  <div>
								  <DynamicSelect
								  label="ชั้นปี"
								  placeholder="กรุณาเลือกชั้นปี"
								  items={years}
								  value={selectedProductId}
								  labelExtractor={({ label }) => label}
								  valueExtractor={({ id }) => id}
								  onValueChange={(value, selectedValue) => {
									  setSelectedProduct(selectedValue);
									  setSelectedProductId(value);
									  setValue("year", selectedValue.label);
								  }}
								  />
							  </div>
							  <div>
								  <label>คณะ</label>
								  <input className="w-full border-b" {...register("faculty")} />
							  </div>
							  <div>
								  <label>สาขา</label>
								  <input className="w-full border-b" {...register("department")} />
							  </div>
							  <div>
								  <label>Email</label>
								  <input className="w-full border-b" {...register("email")} />
							  </div>
							  <div>
								  <label>เบอร์ที่สามารถติดต่อได้</label>
								  <input className="w-full border-b" {...register("phone")} />
							  </div>
							  <div>
								  <label>เหตุผลที่อยากเข้าร่วม</label>
								  <textarea rows={4} className="border-b w-full" {...register("reason")} />
							  </div>
						  
							  <Modal centered opened={opened} onClose={close} withCloseButton={false} className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${opened && 'p-[15px]'} rounded-[20px] bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}>
								  { sending ? <p>กำลังส่งข้อมูล</p>:
									  <>
										  <p className="font-light mb-[5px]">คุณตกลงส่งใบสมัครเข้าเป็นสมาชิกชมรม ใช่หรือไม่</p>
										  <div className="flex gap-2 items-center justify-center">
											  <button
												  type="submit"
												  form="hook-form"
												  className="py-2 px-4 rounded-full bg-[#006664] text-white"
											  >
												  ตกลง
											  </button>
											  <button
												  onClick={close}
												  className="py-2 px-4 rounded-full border border-[#F24B4B] text-[#F24B4B]"
											  >
												  ยกเลิก
											  </button>
										  </div>
									  </>
								  }
							  </Modal>
						  </div>
						  <Modal
							  centered
							  opened={successModalOpened}
							  onClose={closeSuccessModal}
							  withCloseButton={false}
							  className={`shadow-[0_0_20px_-0_rgba(0,0,0,0.1)] w-[312px] ${successModalOpened && 'p-[15px]'} rounded-[20px] bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center`}
						  >
							  <p>ส่งข้อมูลสำเร็จ</p>
						  </Modal>
					  </form>
					  <button
						  onClick={open}
						  className="self-end w-32 bg-inherit text-[#006664] border border-[#006664] px-4 py-1 rounded-full"
					  >
						  สมัคร
					  </button>
				  </>
			  }
		  </div>
	  );
  }
  
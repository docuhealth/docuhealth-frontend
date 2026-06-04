import { useState, useContext } from "react";
import DynamicDate from "../../../Components/DynamicDate/DynamicDate";
import template from "../../../assets/img/template.png";
import { LabAppContext } from "../../../context/HospitalContext/Lab/LabAppContext";
import { FlaskConical, ClipboardList, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Pagination2 from "../../../Components/Dashboard/Patient_Dashboard_Components/Pagination/Pagination2";

const statCards = [
  {
    title: "Total Lab Requests",
    value: 148,
    trend: 12,
    trendText: "increase from last month",
    icon: <FlaskConical size={20} className="text-blue-500" />,
    bgClass: "bg-blue-100",
  },
  {
    title: "Pending Tests",
    value: 23,
    trend: -5,
    trendText: "decrease from last month",
    icon: <ClipboardList size={20} className="text-amber-500" />,
    bgClass: "bg-amber-100",
  },
  {
    title: "Completed Tests",
    value: 125,
    trend: 18,
    trendText: "increase from last month",
    icon: <CheckCircle size={20} className="text-green-500" />,
    bgClass: "bg-green-100",
  },
];

const recentPatients = [
  { name: "Amara Okafor",    date: "30/05/2026", time: "9:45 AM",  hin: "12*********85", sex: "Female" },
  { name: "Emeka Nwosu",     date: "30/05/2026", time: "10:20 AM", hin: "34*********62", sex: "Male"   },
  { name: "Fatima Bello",    date: "29/05/2026", time: "8:30 AM",  hin: "56*********41", sex: "Female" },
  { name: "Chidi Eze",       date: "29/05/2026", time: "11:15 AM", hin: "78*********29", sex: "Male"   },
  { name: "Ngozi Adeyemi",   date: "28/05/2026", time: "2:00 PM",  hin: "90*********73", sex: "Female" },
  { name: "Yusuf Lawal",     date: "28/05/2026", time: "3:30 PM",  hin: "12*********58", sex: "Male"   },
  { name: "Blessing Obi",    date: "27/05/2026", time: "9:00 AM",  hin: "34*********94", sex: "Female" },
  { name: "Kelechi Nnadi",   date: "27/05/2026", time: "4:45 PM",  hin: "56*********37", sex: "Male"   },
  { name: "Halima Usman",    date: "26/05/2026", time: "10:00 AM", hin: "78*********15", sex: "Female" },
  { name: "Tunde Afolabi",   date: "26/05/2026", time: "1:30 PM",  hin: "90*********82", sex: "Male"   },
  { name: "Chinwe Okonkwo",  date: "25/05/2026", time: "8:00 AM",  hin: "11*********66", sex: "Female" },
  { name: "Musa Garba",      date: "25/05/2026", time: "12:00 PM", hin: "23*********49", sex: "Male"   },
  { name: "Aisha Muhammed",  date: "24/05/2026", time: "3:00 PM",  hin: "45*********31", sex: "Female" },
  { name: "Seun Adeola",     date: "24/05/2026", time: "11:45 AM", hin: "67*********78", sex: "Male"   },
  { name: "Ifeoma Okeke",    date: "23/05/2026", time: "9:30 AM",  hin: "89*********52", sex: "Female" },
  { name: "Bayo Adekoya",    date: "23/05/2026", time: "2:15 PM",  hin: "13*********96", sex: "Male"   },
  { name: "Zainab Sule",     date: "22/05/2026", time: "10:45 AM", hin: "35*********07", sex: "Female" },
  { name: "Obinna Dike",     date: "22/05/2026", time: "4:00 PM",  hin: "57*********43", sex: "Male"   },
  { name: "Adaeze Eze",      date: "21/05/2026", time: "8:15 AM",  hin: "79*********88", sex: "Female" },
  { name: "Ibrahim Salisu",  date: "21/05/2026", time: "1:00 PM",  hin: "91*********24", sex: "Male"   },
];

const PAGE_SIZE = 8;

const Hospital_Lab_Home_Dashboard = () => {
  const { backgroundImage, hospitalName } = useContext(LabAppContext);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(recentPatients.length / PAGE_SIZE);
  const paginated = recentPatients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className="py-2">
        <DynamicDate />

        {/* Cover Banner */}
        <div
          className="relative mt-4 w-full h-[300px] rounded-xl bg-cover bg-center flex flex-col items-center justify-center border border-gray-300"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${backgroundImage || template})`
          }}
        >
          <div className="text-white text-center mb-4">
            <p className="text-xl font-semibold opacity-90 uppercase tracking-widest">
              {hospitalName || "NIL"} Hospital Laboratory
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-md p-5 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-sm flex items-center justify-center border ${stat.bgClass}`}>
                {stat.icon}
              </div>
              <p className="text-sm font-semibold text-[#1B2B40]">{stat.title}</p>
            </div>
            <p className="text-3xl font-semibold text-[#647284] mb-3">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 flex-wrap">
              <span className={`flex items-center gap-0.5 ${stat.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {stat.trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(stat.trend)}%
              </span>{" "}
              {stat.trendText}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-lg my-5">
        <div className="border rounded-lg p-4 lg:p-6">
          <h2 className="mb-4 pb-2 border-b font-medium">Recent Patients attended to</h2>

          {/* Desktop grid */}
          <div className="hidden lg:flex lg:flex-col">
            <div className="grid grid-cols-7 text-left text-sm bg-gray-100 py-5 rounded-md">
              <div className="col-span-2 pl-5">Patient&apos;s Name</div>
              <p className="col-span-2">Date / Time</p>
              <p className="col-span-2">HIN</p>
              <p>Sex</p>
            </div>
            {paginated.map((p, i) => (
              <div key={i} className="grid grid-cols-7 items-center text-[12px] text-gray-700 border-b border-b-gray-200">
                <div className="font-semibold col-span-2 py-6 pl-5 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6654 12.834H10.4987V11.6673C10.4987 10.7008 9.71522 9.91732 8.7487 9.91732H5.2487C4.2822 9.91732 3.4987 10.7008 3.4987 11.6673V12.834H2.33203V11.6673C2.33203 10.0565 3.63787 8.75065 5.2487 8.75065H8.7487C10.3595 8.75065 11.6654 10.0565 11.6654 11.6673V12.834ZM6.9987 7.58398C5.0657 7.58398 3.4987 6.01698 3.4987 4.08398C3.4987 2.15099 5.0657 0.583984 6.9987 0.583984C8.93169 0.583984 10.4987 2.15099 10.4987 4.08398C10.4987 6.01698 8.93169 7.58398 6.9987 7.58398ZM6.9987 6.41732C8.28734 6.41732 9.33203 5.37265 9.33203 4.08398C9.33203 2.79532 8.28734 1.75065 6.9987 1.75065C5.71003 1.75065 4.66536 2.79532 4.66536 4.08398C4.66536 5.37265 5.71003 6.41732 6.9987 6.41732Z" fill="#647284" />
                  </svg>
                  <p>{p.name}</p>
                </div>
                <p className="col-span-2">{p.date} / {p.time}</p>
                <p className="col-span-2">{p.hin}</p>
                <p>{p.sex}</p>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden flex flex-col gap-4">
            {paginated.map((p, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-md p-5 duration-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-[#3E4095] flex items-center justify-center font-bold text-sm border border-blue-100 uppercase">
                      {p.name.split(" ")[0]?.[0]}{p.name.split(" ")[1]?.[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-[14px] leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">{p.sex}</p>
                    </div>
                  </div>
                  <span className="bg-gray-50 text-gray-600 text-[10px] px-2 py-1 rounded-md border border-gray-100 font-medium uppercase tracking-wider">
                    {p.hin?.slice(-4) || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-4 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Date</p>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <i className="bx bx-calendar text-[#3E4095] text-[14px]"></i>
                      <p className="text-[11.5px] font-medium leading-none">{p.date}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 pl-5">at {p.time}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-0.5">Sex</p>
                    <p className="text-[11.5px] font-medium text-gray-700">{p.sex}</p>
                  </div>
                </div>

                <div className="mt-4 bg-[#F8F9FF] rounded-lg p-2.5 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-[#3E4095] uppercase">HIN Number</span>
                  <span className="text-[12px] font-mono font-bold text-gray-600 tracking-widest">{p.hin}</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination2
            count={recentPatients.length}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};

export default Hospital_Lab_Home_Dashboard;

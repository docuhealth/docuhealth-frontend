import React from 'react';

export const renderListOrString = (content) => {
    if (!content) return <p>NIL</p>;
    let parsedContent = content;
    
    // Safely parse stringified arrays like ["[]"] or ["[\"Some string\"]"]
    if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'string' && content[0].startsWith('[')) {
      try {
        parsedContent = JSON.parse(content[0]);
      } catch (e) {
        parsedContent = content;
      }
    } else if (typeof content === 'string' && content.startsWith('[')) {
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        parsedContent = content;
      }
    }
    
    if (typeof parsedContent === 'string') return <p>{parsedContent || 'NIL'}</p>;
    if (Array.isArray(parsedContent)) {
      if (parsedContent.length === 0) return <p>NIL</p>;
      return (
        <ul className="list-disc pl-5 space-y-1">
          {parsedContent.map((item, index) => (
            <li key={index}>{typeof item === 'object' ? item.note : item}</li>
          ))}
        </ul>
      );
    }
    return <p>NIL</p>;
};

export const renderLabTests = (labTests) => {
  if (!labTests || labTests.length === 0) return null;
  
  const flatItems = labTests.reduce((acc, orderOrItem) => {
    if (orderOrItem.items_info && Array.isArray(orderOrItem.items_info)) {
      return acc.concat(orderOrItem.items_info);
    }
    if (orderOrItem.items && Array.isArray(orderOrItem.items)) {
      return acc.concat(orderOrItem.items);
    }
    return acc.concat([orderOrItem]);
  }, []);

  if (flatItems.length === 0) return null;

  return (
    <div className="my-8 flex flex-col gap-8">
      {flatItems.map((labTest, idx) => {
        const testInfo = labTest.test_info;
        const resultInfo = labTest.result_info;
        const resultParams = resultInfo?.parameters || [];
        const isCompleted = labTest.status === "completed" || labTest.status === "accepted" || labTest.status === "result_ready" || labTest.status === "approved";
        const hasResults = resultParams.length > 0;
        
        return (
          <div key={idx} className="w-full">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[16px] font-bold text-docuhealth-dark">{testInfo?.name}</p>
              <span className={`text-[10px] px-3 py-1.5 rounded-md border font-bold uppercase tracking-wider ${
                isCompleted ? 'bg-green-50 text-green-600 border-green-100' :
                labTest.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' :
                labTest.status === 'sample_collected' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-yellow-50 text-yellow-600 border-yellow-100'
              }`}>
                {labTest.status?.replace(/_/g, ' ')}
              </span>
            </div>
            
            {hasResults ? (
               <div className="flex flex-col gap-4">
                 <div className="bg-white border border-gray-200 rounded-xl overflow-hidden pb-2">
                   {/* Desktop Table */}
                   <div className="hidden md:flex flex-col text-[13px] w-full pt-4">
                     <div className="grid grid-cols-4 text-left font-semibold text-gray-700 bg-docuhealth-bg-offwhite rounded-full mx-4 py-3 px-6 mb-2">
                       <p>Test</p>
                       <p>Result</p>
                       <p>Reference range</p>
                       <p>Status</p>
                     </div>
                     {resultParams.map((p, i) => {
                       const info = p.parameter_info;
                       let paramStatus = p.status || null;
                       
                       if (!paramStatus) {
                           const num = parseFloat(p.value);
                           if (!isNaN(num) && info.ref_low != null && info.ref_high != null) {
                               paramStatus = num >= info.ref_low && num <= info.ref_high ? "Normal" : "Abnormal";
                           }
                       }
                       
                       const statusText = paramStatus || "—";
                       const isRed = statusText.toLowerCase() === "negative" || statusText.toLowerCase() === "abnormal";
                       const isGreen = statusText.toLowerCase() === "positive" || statusText.toLowerCase() === "normal";
                       const refRange = info.ref_text || (info.ref_low != null && info.ref_high != null ? `${info.ref_low} - ${info.ref_high}` : "—");
                       
                       return (
                         <div key={i} className="grid grid-cols-4 items-center py-4 px-10 border-b border-gray-50 last:border-0 text-gray-600">
                           <p>{info.name}</p>
                           <p className="font-semibold text-gray-800">{p.value ?? "—"} {info.unit || ""}</p>
                           <p>{refRange}</p>
                           <p className={`capitalize font-medium ${isRed ? "text-red-500" : isGreen ? "text-green-600" : "text-gray-500"}`}>
                             {statusText}
                           </p>
                         </div>
                       )
                     })}
                   </div>

                   {/* Mobile Cards */}
                   <div className="md:hidden flex flex-col gap-3 p-4">
                     {resultParams.map((p, i) => {
                       const info = p.parameter_info;
                       let paramStatus = p.status || null;
                       if (!paramStatus) {
                           const num = parseFloat(p.value);
                           if (!isNaN(num) && info.ref_low != null && info.ref_high != null) {
                               paramStatus = num >= info.ref_low && num <= info.ref_high ? "Normal" : "Abnormal";
                           }
                       }
                       const statusText = paramStatus || "—";
                       const isRed = statusText.toLowerCase() === "negative" || statusText.toLowerCase() === "abnormal";
                       const isGreen = statusText.toLowerCase() === "positive" || statusText.toLowerCase() === "normal";
                       const refRange = info.ref_text || (info.ref_low != null && info.ref_high != null ? `${info.ref_low} - ${info.ref_high}` : "—");
                       
                       return (
                         <div key={i} className="border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                           <div className="flex justify-between items-start mb-3">
                             <p className="font-bold text-sm text-gray-800">{info.name}</p>
                             <span className={`text-[10px] px-2 py-1 rounded-md border font-medium capitalize ${
                               isGreen ? "bg-green-50 text-green-600 border-green-100" :
                               isRed ? "bg-red-50 text-red-500 border-red-100" :
                               "bg-gray-100 text-gray-600 border-gray-200"
                             }`}>
                               {statusText}
                             </span>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-xs">
                             <div>
                               <p className="text-gray-400 mb-1 uppercase text-[10px] font-semibold">Result</p>
                               <p className="font-semibold text-gray-800">{p.value ?? "—"} {info.unit || ""}</p>
                             </div>
                             <div>
                               <p className="text-gray-400 mb-1 uppercase text-[10px] font-semibold">Ref Range</p>
                               <p className="font-medium text-gray-600">{refRange}</p>
                             </div>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 </div>
                 
                 {(resultInfo?.interpretation || resultInfo?.clinical_correlation) && (
                   <div className="bg-white border border-gray-200 rounded-xl px-5 py-5 flex flex-col gap-4">
                     {resultInfo?.interpretation && (
                       <div>
                         <p className="text-[12px] text-gray-500 mb-1 uppercase font-semibold">Interpretation</p>
                         <p className="text-[13px] font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                           {resultInfo.interpretation}
                         </p>
                       </div>
                     )}
                     {resultInfo?.clinical_correlation && (
                       <div>
                         <p className="text-[12px] text-gray-500 mb-1 uppercase font-semibold">Clinical correlation</p>
                         <p className="text-[13px] font-medium text-gray-800 whitespace-pre-line leading-relaxed">
                           {resultInfo.clinical_correlation}
                         </p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
            ) : (
               <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
                 <p className="text-[13px] font-semibold text-gray-500">
                   {labTest.status === "rejected" ? "Lab result was rejected." : 
                     (labTest.status === "result_ready" && !resultInfo ? "Lab result is ready, but yet to be approved by a doctor." :
                     (isCompleted ? "Lab result is ready." : "Lab result is pending..."))}
                 </p>
                 {testInfo?.parameters?.length > 0 && (
                   <p className="text-[11px] text-gray-400 mt-2">
                     Requested tests: {testInfo.parameters.map(p => p.name).join(", ")}
                   </p>
                 )}
               </div>
            )}
          </div>
        )
      })}
    </div>
  );
};

export const renderDrugRecords = (drugOrdersInfo) => {
  if (!drugOrdersInfo || drugOrdersInfo.length === 0) {
    return (
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className=" mb-4">
          <p className="font-medium text-docuhealth-dark">Medication / Drug Records</p>
        </div>
        <div className="overflow-x-auto">
          <p className="text-[12px] text-gray-500 italic">No medication records available.</p>
        </div>
      </div>
    );
  }

  // Support both new `drug_orders_info` structure and old `drug_records` flat array.
  const flatDrugs = drugOrdersInfo[0]?.drugs 
    ? drugOrdersInfo.flatMap(order => order.drugs || [])
    : drugOrdersInfo;

  if (flatDrugs.length === 0) {
    return (
      <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
        <div className=" mb-4">
          <p className="font-medium text-docuhealth-dark">Medication / Drug Records</p>
        </div>
        <div className="overflow-x-auto">
          <p className="text-[12px] text-gray-500 italic">No medication records available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 my-5 bg-docuhealth-light-gray border rounded-lg">
      <div className=" mb-4">
        <p className="font-medium text-docuhealth-dark">Medication / Drug Records</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[12px] text-gray-400 border-b">
              <th className="pb-2 font-normal">Drug Name</th>
              <th className="pb-2 font-normal">Route</th>
              <th className="pb-2 font-normal">Qty</th>
              <th className="pb-2 font-normal">Frequency</th>
              <th className="pb-2 font-normal">Duration</th>
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {flatDrugs.map((drugItem, index) => {
              const drug = drugItem.drug_record || drugItem;
              return (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 font-medium text-docuhealth-primary">
                    {drug.name}
                  </td>
                  <td className="py-3 text-gray-600">{drug.route || "Oral"}</td>
                  <td className="py-3 text-gray-600">{drug.quantity}</td>
                  <td className="py-3 text-gray-600">
                    {typeof drug.frequency === 'object'
                      ? `${drug.frequency.value || ''} ( ${drug.frequency.rate || ''} )`
                      : drug.frequency || "N/A"}
                  </td>
                  <td className="py-3 text-gray-600">
                    {typeof drug.duration === 'object'
                      ? `${drug.duration.value || ''} ( ${drug.duration.rate || ''} )`
                      : drug.duration || "N/A"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};


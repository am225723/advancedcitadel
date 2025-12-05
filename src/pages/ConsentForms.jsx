import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConsentForms = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [formData, setFormData] = useState({});

  const pages = [
    {
      type: 'cover',
      title: 'The New Dawn',
      subtitle: "Eric Mensel's Path",
    },
    {
      type: 'letter',
      title: "A Note to Eric",
      content: `Eric, I know your story. You've been through it all. CBT since you were 15, EMDR, exposure therapy, talk therapy, meds stacked on meds, even ketamine. You've done every worksheet, every exercise, every version of 'try harder.' And honestly? You've earned the right to roll your eyes when someone suggests 'therapy' again.

Here's my answer: because I'm not offering you the same thing you've already done. I'm not another therapist with a clipboard and a smile asking, 'How does that make you feel?' I'm not going to bury you under another pile of worksheets you've seen 48 different times.

I'm alternative. Way outside the box. I'll be the guy who builds Legos with you at the park because sometimes your brain needs something to do with your hands. I'll sit elbows-deep with you under the hood of your Evo, making fun of how it's basically a tin can while also pointing out that the way you hold that car together with duct tape and spare parts isn't so different from how you've been holding yourself together.

I'll even show up at your place, controller in hand, and kick your ass in whatever video game you want — because therapy doesn't have to mean two chairs and a box of tissues.

And here's the promise: I'll still be your therapist. I'll still push you, still challenge you, still call you out when you're running from yourself. But I'll also be the best friend in the room — the one you think of when you're spiraling, when you're doubting yourself, when you just need someone to sit nearby so you're not alone with your thoughts.

You don't need another therapist who looks at you like a case study. You need someone who meets you where you are, in your real life — who can talk cars, games, panic attacks, and self-doubt all in the same breath, and actually mean it.

So yeah, I'll be the therapist. But I'll also be the guy who builds, explores, wrenches, and laughs with you — and proves you're not alone, every damn time.`
    },
    {
      type: 'section',
      title: 'Informed Consent (1/2)',
      sections: [
        { heading: 'About Psychotherapy Services', content: 'Psychotherapy is a working cooperative relationship between you and your therapist. Each member has responsibilities. Your therapist contributes knowledge and clinical skills. You have the responsibility to bring collaboration and commitment. Please note that psychotherapy is NOT an emergency service. If experiencing suicidal/homicidal thoughts, call 911.' },
        { heading: 'Benefits and Risks', content: 'Psychotherapy has benefits and risks. Risks may include uncomfortable feelings like sadness, guilt, anxiety, anger. However, therapy has been shown to reduce distress, increase satisfaction in relationships, increase personal awareness, and improve stress management skills. Note: there are no guarantees. Therapy requires active effort on your part.' },
        { heading: 'The First Few Sessions', content: 'Initial sessions involve comprehensive evaluation of your needs. By the end, I will offer initial impressions of our work and we will discuss treatment goals and create an initial treatment plan. You should evaluate if you feel comfortable working with me.' }
      ]
    },
    {
      type: 'section',
      title: 'Informed Consent (2/2)',
      sections: [
        { heading: 'Appointments and Cancellations', content: 'Appointments are typically held at the same time each week at agreed cadence (weekly or bi-weekly). You may cancel in advance free of charge with sufficient notice. For no-shows or last-minute cancellations, a fee applies.' },
        { heading: 'Professional Records', content: 'I keep records of your services, reasons for therapy, treatment goals, diagnosis, topics discussed, medical and social history, and billing records. You have the right to a copy of your file except in unusual circumstances involving danger to yourself.' },
        { heading: 'Confidentiality', content: 'Communication is confidential and will not be discussed without written permission. However, I have legal obligation to break confidentiality if: there is child/elder abuse, serious intent to harm self/others, criminal activity, court order, or if you introduce your condition into legal proceedings.' },
        { heading: 'Consent Signature', content: 'Your signature indicates you have read and understand this information.', hasSignature: true }
      ]
    },
    {
      type: 'section',
      title: 'Financial Responsibility',
      sections: [
        { heading: 'Payment of Fees - "Pay What You Can"', content: 'I do not have a set fee for services. You agree to pay an amount you are able to and believe is justified for services received. You are responsible for determining this amount and making payments after sessions.' },
        { heading: 'Accepted Payment Methods', content: 'Cash App, Venmo, PayPal, or Secure Website: pay.aleix.help/eric. Payment is due after each session unless otherwise agreed.' },
        { heading: 'Insurance and Managed Care', content: 'If participating in your insurance plan, you agree to pay all applicable deductibles, co-payments, and co-insurances. If insurance benefits run out, you become responsible for all charges. If your insurance denies the visit, you may be responsible to pay in full.' },
        { heading: 'Financial Signature', content: 'Your signature authorizes billing and insurance practices.', hasSignature: true }
      ]
    },
    {
      type: 'section',
      title: 'HIPAA Notice of Privacy Practices (1/2)',
      sections: [
        { heading: 'Overview', content: 'This notice describes how health information may be used and disclosed. Unleash Your Hue is required by law to protect health information, provide this notice, and follow all terms. We will notify you of any breach of unsecured protected health information.' },
        { heading: 'How Your Information Is Used', content: 'We may use and disclose health information for: Treatment (referrals, prescriptions), Payment (insurance claims), and Healthcare Operations (review of procedures, compliance).' }
      ]
    },
    {
      type: 'section',
      title: 'HIPAA Notice (2/2)',
      sections: [
        { heading: 'Disclosures Without Authorization', content: 'We may disclose info without authorization for emergencies, judicial proceedings, public health activities, child/elder abuse reporting, criminal activity, health oversight activities, and to business associates.' },
        { heading: 'Your Individual Rights', content: 'You have the right to: Inspect and copy health information, Request amendments, Receive list of disclosures, Request restrictions on use/disclosure, and Request confidential communications.' },
        { heading: 'Complaints and Contact', content: 'You may complain to us or the Secretary of Health and Human Services. File complaints with Privacy Officer at aleix@unleashyourhue.com or (860) 200-2053. Email and text have privacy risks.' },
        { heading: 'HIPAA Acknowledgment', content: 'I acknowledge receipt of this Notice.', hasSignature: true }
      ]
    },
    {
      type: 'section',
      title: 'Telehealth Informed Consent',
      sections: [
        { heading: 'Telehealth Services', content: 'You consent to receive telemental health sessions through secure video/phone connection. Health information will be electronically transmitted between you and Provider.' },
        { heading: 'Agreement', content: '• You have the right to withhold or withdraw consent without affecting future care\n• Benefits: increased accessibility and efficiency\n• Risks: transmission disruption, confidentiality breaches\n• No recording without disclosure and agreement\n• Provider may require in-person if suicidal/homicidal thoughts or crisis\n• Technical difficulties may result in service interruptions' },
        { heading: 'Telehealth Consent Signature', content: 'Your signature confirms understanding and consent.', hasSignature: true }
      ]
    },
    {
      type: 'section',
      title: 'Client Demographics',
      sections: [
        { heading: 'Personal Information', content: 'Please provide: Name, Date of Birth, Gender, SSN (optional), Race, Ethnicity, Address, Phone, Email, and whether messaging is OK.' },
        { heading: 'Emergency Contact', content: 'Please provide emergency contact name, relationship, and phone number.' }
      ]
    },
    {
      type: 'section',
      title: 'Social History',
      sections: [
        { heading: 'Employment Status', content: 'Employed (Satisfied), Employed (Dissatisfied), Unemployed, Disabled, Student, Retired, or Other?' },
        { heading: 'Relationships and Family', content: 'Please describe your current relationship status, living situation, and significant family relationships.' },
        { heading: 'Substance Use', content: 'Please disclose any current or past use of alcohol, tobacco, or other substances.' },
        { heading: 'Medical History', content: 'Please list any significant medical conditions, medications, hospitalizations, or surgeries.' }
      ]
    }
  ];

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(
      (e.clientX || e.touches?.[0]?.clientX) - rect.left,
      (e.clientY || e.touches?.[0]?.clientY) - rect.top
    );
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(
      (e.clientX || e.touches?.[0]?.clientX) - rect.left,
      (e.clientY || e.touches?.[0]?.clientY) - rect.top
    );
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const currentPageData = pages[currentPage];

  return (
    <>
      <Helmet>
        <title>Consent Forms - The Citadel</title>
        <meta name="description" content="Therapeutic consent and agreement forms." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient-gold font-cinzel">Consent Forms & Agreements</h1>
          <p className="text-slate-400 font-garamond">Page {currentPage + 1} of {pages.length} • Interactive workbook • Click fields to fill</p>
        </div>

        <div className="bg-dark-steel/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-white text-dark-steel min-h-[500px] p-8 space-y-4 overflow-y-auto max-h-[600px]">
            {currentPageData.type === 'cover' && (
              <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
                <div className="text-6xl font-bold text-gradient-gold font-cinzel">{currentPageData.title}</div>
                <div className="text-2xl text-slate-600 font-garamond">{currentPageData.subtitle}</div>
              </div>
            )}

            {currentPageData.type === 'letter' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gold-accent font-cinzel">{currentPageData.title}</h2>
                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-garamond">
                  {currentPageData.content}
                </div>
              </div>
            )}

            {currentPageData.type === 'section' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gold-accent font-cinzel">{currentPageData.title}</h2>
                {currentPageData.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2 border-l-4 border-gold-accent/30 pl-4">
                    <h3 className="font-bold text-slate-800 text-sm">{section.heading}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{section.content}</p>
                    {section.hasSignature && (
                      <div className="space-y-3 mt-4">
                        <label className="block font-bold text-slate-800 text-xs">Signature</label>
                        <div className="border-2 border-slate-300 bg-slate-50 rounded p-2">
                          <canvas
                            ref={canvasRef}
                            width={300}
                            height={80}
                            className="border-b-2 border-slate-300 cursor-crosshair w-full bg-white rounded"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                          />
                        </div>
                        <Button
                          onClick={clearSignature}
                          variant="ghost"
                          size="sm"
                          className="text-slate-600 hover:text-slate-900 text-xs float-right"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                        <div className="clear-both">
                          <input type="text" placeholder="Date" className="border-b border-slate-300 text-sm w-32 p-1" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dark-steel/80 border-t border-slate-700 p-4 flex items-center justify-between">
            <Button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="bg-gold-accent hover:bg-gold-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Previous
            </Button>

            <div className="text-slate-300 text-sm font-cinzel">
              {currentPage + 1} / {pages.length}
            </div>

            <Button
              onClick={nextPage}
              disabled={currentPage === pages.length - 1}
              className="bg-gold-accent hover:bg-gold-accent/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        <div className="bg-dark-steel/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold-accent mb-3 font-cinzel">About These Forms</h3>
          <p className="text-slate-400 font-garamond leading-relaxed">
            These comprehensive forms document informed consent, financial agreements, privacy practices, and client information. 
            Please review carefully and contact us with any questions. All information is kept confidential and secure.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConsentForms;

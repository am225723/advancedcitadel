import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ConsentForms = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [formData, setFormData] = useState({});

  // Page content for the workbook
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

Here's my answer: because I'm not offering you the same thing you've already done. I'm not another therapist with a clipboard and a smile asking, 'How does that make you feel?'

I'm alternative. Way outside the box. I'll be the guy who builds Legos with you at the park because sometimes your brain needs something to do with your hands, not another "deep breathing worksheet." I'll ghost with you to check out some random diner, or backroads, or whatever place sparks your curiosity — so your nervous system gets reminded that life still has things worth showing up for.

I'll even show up at your place, controller in hand, and kick your ass in whatever video game you want — because therapy doesn't have to mean two chairs and a box of tissues. Sometimes it means laughing, competing, hanging out, and letting real conversations happen while we're doing something else.

And here's the promise: I'll still be your therapist. I'll still push you, still challenge you, still call you out when you're running from yourself. But I'll also be the best friend in the room — the one you think of when you're spiraling, when you're doubting yourself, when you just need someone to sit nearby so you're not alone with your thoughts.

You don't need another therapist who looks at you like a case study. You need someone who meets you where you are, in your real life — who can talk cars, games, panic attacks, and self-doubt all in the same breath, and actually mean it.`
    },
    {
      type: 'form',
      title: 'Informed Consent (1/2)',
      sections: [
        {
          heading: 'Understanding the Therapeutic Relationship',
          content: [
            { text: 'I understand that the therapeutic relationship between myself and my therapist is:', type: 'text' },
            { text: 'A collaborative partnership aimed at supporting my mental health and well-being', type: 'checkbox', label: 'Collaborative Partnership' },
            { text: 'Different from a friendship, even though there may be informal elements', type: 'checkbox', label: 'Not a Friendship' },
            { text: 'Based on confidentiality and professional boundaries', type: 'checkbox', label: 'Confidential & Bounded' },
          ]
        },
        {
          heading: 'Therapeutic Approach',
          content: [
            { text: 'My therapist has explained that our work may include:', type: 'text' },
            { text: 'Traditional therapeutic modalities (CBT, exposure therapy, etc.)', type: 'checkbox', label: 'Traditional Modalities' },
            { text: 'Alternative and informal settings (outdoor activities, recreational activities)', type: 'checkbox', label: 'Alternative Settings' },
            { text: 'Creative and experiential activities designed to support therapeutic goals', type: 'checkbox', label: 'Creative Activities' },
          ]
        }
      ]
    }
  ];

  // Start drawing on canvas
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
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
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const currentPageData = pages[currentPage];

  return (
    <>
      <Helmet>
        <title>Consent Forms - The Citadel</title>
        <meta name="description" content="Therapeutic consent and agreement forms." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gradient-gold font-cinzel">Consent Forms & Agreements</h1>
          <p className="text-slate-400 font-garamond">Interactive workbook • Click fields to fill</p>
        </div>

        {/* Flipbook Container */}
        <div className="bg-dark-steel/50 border border-slate-700 rounded-lg overflow-hidden">
          {/* Page Content */}
          <div className="bg-white text-dark-steel min-h-[500px] p-8 space-y-4 overflow-y-auto max-h-[600px]">
            {currentPageData.type === 'cover' && (
              <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-6">
                <div className="text-6xl font-bold text-gradient-gold font-cinzel">
                  {currentPageData.title}
                </div>
                <div className="text-2xl text-slate-600 font-garamond">
                  {currentPageData.subtitle}
                </div>
              </div>
            )}

            {currentPageData.type === 'letter' && (
              <div className="space-y-4">
                <div className="border-b-2 border-slate-300 pb-2">
                  <span className="text-sm font-bold text-gold-accent">Unleash Your Hue</span>
                  <span className="float-right text-sm text-slate-500">Welcome</span>
                </div>
                <h2 className="text-2xl font-bold text-gold-accent font-cinzel">{currentPageData.title}</h2>
                <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-garamond">
                  {currentPageData.content}
                </div>
              </div>
            )}

            {currentPageData.type === 'form' && (
              <div className="space-y-6">
                <div className="border-b-2 border-slate-300 pb-2">
                  <span className="text-sm font-bold text-gold-accent">Unleash Your Hue</span>
                  <span className="float-right text-sm text-slate-500">Form 01</span>
                </div>
                <h2 className="text-2xl font-bold text-gold-accent font-cinzel">{currentPageData.title}</h2>

                {currentPageData.sections.map((section, idx) => (
                  <div key={idx} className="space-y-3 border-l-4 border-gold-accent/30 pl-4">
                    <h3 className="font-bold text-slate-800 uppercase text-sm">{section.heading}</h3>
                    {section.content.map((item, itemIdx) => (
                      <div key={itemIdx} className="text-sm text-slate-700">
                        {item.type === 'text' && (
                          <p className="italic">{item.text}</p>
                        )}
                        {item.type === 'checkbox' && (
                          <label className="flex items-center cursor-pointer hover:bg-slate-100 p-2 rounded">
                            <input
                              type="checkbox"
                              className="mr-3 w-4 h-4 accent-gold-accent"
                              checked={formData[`${idx}-${itemIdx}`] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                [`${idx}-${itemIdx}`]: e.target.checked
                              })}
                            />
                            <span>{item.label}</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {/* Signature Area */}
                <div className="space-y-3 border-t-2 border-slate-200 pt-6 mt-6">
                  <label className="block font-bold text-slate-800 text-sm">Your Signature</label>
                  <div className="border-2 border-slate-300 bg-slate-50 rounded p-2">
                    <canvas
                      ref={canvasRef}
                      width={350}
                      height={100}
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
                    className="text-slate-600 hover:text-slate-900 float-right"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear Signature
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
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
              Page {currentPage + 1} of {pages.length}
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

        {/* Info Card */}
        <div className="bg-dark-steel/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gold-accent mb-3 font-cinzel">About These Forms</h3>
          <p className="text-slate-400 font-garamond leading-relaxed">
            These forms document your informed consent and agreement regarding your therapeutic work. 
            They outline the nature of the therapeutic relationship, confidentiality, and our collaborative approach 
            to your mental health and well-being. Please read carefully and contact us with any questions.
          </p>
        </div>
      </div>
    </>
  );
};

export default ConsentForms;

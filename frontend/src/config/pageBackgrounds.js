const PAGE_BACKGROUNDS = {
  home: { treatment: 'home', image: '/Assets/hero-bg.webp', fallback: 'linear-gradient(135deg, #e9f7fc 0%, #ffffff 58%, #dff2f9 100%)' },
  about: { treatment: 'editorial', fallback: 'radial-gradient(ellipse at 85% 12%, #dff2f9 0, transparent 44%), #ffffff' },
  'what-we-do': { treatment: 'editorial', fallback: 'linear-gradient(150deg, #f0f8fb, #ffffff 52%, #e5f4fa)' },
  projects: { treatment: 'editorial', fallback: 'radial-gradient(ellipse at 12% 30%, #e5f4fa 0, transparent 42%), #ffffff' },
  initiatives: { treatment: 'editorial', fallback: 'linear-gradient(120deg, #ffffff, #edf8fc 65%, #e4f3f8)' },
  insights: { treatment: 'editorial', fallback: 'radial-gradient(ellipse at 78% 18%, #e1f3fa 0, transparent 40%), #ffffff' },
  partners: { treatment: 'editorial', fallback: 'linear-gradient(145deg, #eaf7fb, #ffffff 58%, #e1f2f8)' },
  leadership: { treatment: 'editorial', fallback: 'radial-gradient(ellipse at 50% 0, #e2f3f9 0, transparent 46%), #ffffff' },
  resources: { treatment: 'editorial', fallback: 'linear-gradient(110deg, #ffffff, #eef8fb 55%, #e4f3f8)' },
  careers: { treatment: 'editorial', fallback: 'radial-gradient(ellipse at 90% 20%, #e3f4f9 0, transparent 42%), #ffffff' },
  'partner-with-us': { treatment: 'editorial', fallback: 'linear-gradient(135deg, #e5f4f9, #ffffff 50%, #edf8fb)' },
  privacy: { treatment: 'texture', fallback: 'radial-gradient(ellipse at 85% 12%, #e6f5fa 0, transparent 44%), #fff' },
  terms: { treatment: 'texture', fallback: 'linear-gradient(140deg, #fff, #f0f8fb)' },
  accessibility: { treatment: 'texture', fallback: 'radial-gradient(ellipse at 15% 15%, #e3f4f9 0, transparent 42%), #fff' },
  notFound: { treatment: 'texture', fallback: 'linear-gradient(135deg, #eaf7fb, #fff 60%, #e3f4f9)' },
};

export default PAGE_BACKGROUNDS;

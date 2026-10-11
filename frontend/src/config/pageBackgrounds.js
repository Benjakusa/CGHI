import intelligenceForum from '../Assets/569216347_122098062855084791_1251837625259459798_n.jpg';
import preparednessForum from '../Assets/571242884_122098061637084791_6856730123211462823_n.jpg';
import oneHealthForum from '../Assets/574016059_122103367773084791_5896764519969786179_n.jpg';
import researchForum from '../Assets/579432600_122106057741084791_5709000695062609898_n.jpg';
import partnerForum from '../Assets/581196268_122106058011084791_1001770831442132854_n.jpg';

const imageBackground = (image, position = 'center') => ({ image, position, treatment: 'image' });

const PAGE_BACKGROUNDS = {
  home: imageBackground(preparednessForum, 'center 38%'),
  about: imageBackground(intelligenceForum, 'center 35%'),
  'what-we-do': imageBackground(researchForum, 'center 40%'),
  projects: imageBackground(oneHealthForum, 'center 38%'),
  initiatives: imageBackground(oneHealthForum, 'center 58%'),
  insights: imageBackground(researchForum, 'center 35%'),
  news: imageBackground(researchForum, 'center 35%'),
  'insights-detail': imageBackground(intelligenceForum, 'center 42%'),
  'project-detail': imageBackground(oneHealthForum, 'center 42%'),
  partners: imageBackground(partnerForum, 'center 35%'),
  leadership: imageBackground(intelligenceForum, 'center 35%'),
  resources: imageBackground(preparednessForum, 'center 55%'),
  careers: imageBackground(partnerForum, 'center 58%'),
  'partner-with-us': imageBackground(partnerForum, 'center 38%'),
  privacy: imageBackground(intelligenceForum, 'center 62%'),
  terms: imageBackground(researchForum, 'center 60%'),
  accessibility: imageBackground(oneHealthForum, 'center 62%'),
  notFound: imageBackground(preparednessForum, 'center 48%'),
};

export default PAGE_BACKGROUNDS;

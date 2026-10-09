export interface SkillGroup {
  title: string;
  items: string[];
}

export interface FlowStep {
  /** Short node label shown in the animated pipeline (keep to ~2 words). */
  label: string;
  /** One line explaining the step, shown in the expanded "How it works". */
  detail: string;
}

export interface StackGroup {
  label: string;
  items: string[];
}

export interface Project {
  idx: string;
  /** File name stem for the thumbnail in public/assets/projects/. */
  slug: string;
  title: string;
  cat: string;
  origin?: string;
  /** One line shown on the card. */
  summary: string;
  /** Pop-up content. */
  problem: string;
  solution: string;
  result?: string;
  tags: string[];
  flow: FlowStep[];
  contribution: string[];
  stack: StackGroup[];
}

export interface TimelineEntry {
  period: string;
  role: string;
  company: string;
  location: string;
  summary: string;
  highlights: string[];
  tags: string[];
  current?: boolean;
}

export interface Education {
  degree: string;
  field: string;
  school: string;
  period: string;
}

export interface Stat {
  num: number;
  suffix: string;
  label: string;
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'LLMs, Agents & Retrieval',
    items: ['Agentic AI', 'LLMs', 'RAG', 'LangChain', 'Ollama', 'Tool Calling', 'FAISS (IVF, HNSW)', 'Cross-Encoder Re-ranking', 'Retrieval Evaluation'],
  },
  {
    title: 'Deep Learning & Edge AI',
    items: ['PyTorch', 'Keras', 'CNNs', 'Transfer Learning', 'Pruning', 'BNNs', 'AdderNet', 'DeepShift', 'Machine Unlearning'],
  },
  {
    title: 'ML & Computer Vision',
    items: ['Scikit-learn', 'XGBoost', 'Ensemble Learning', 'Feature Engineering', 'Explainable AI', 'Semantic Segmentation', 'Object Detection'],
  },
  {
    title: 'Backend & Media',
    items: ['FastAPI', 'REST APIs', 'asyncio', 'Pydantic', 'Webhooks', 'React/TypeScript', 'ffmpeg', 'ElevenLabs'],
  },
  {
    title: 'DevOps & Testing',
    items: ['Docker', 'Docker Compose', 'GitHub Actions', 'pytest', 'Structured Logging', 'Caching', 'Render', 'Vercel'],
  },
  {
    title: 'Languages & Data',
    items: ['Python', 'SQL', 'C/C++', 'Pandas', 'NumPy', 'Matplotlib', 'Power BI', 'MySQL'],
  },
];

export const focusAreas: string[] = [
  'Large Language Models',
  'Agentic AI',
  'RAG & Vector Search',
  'Edge AI & Model Compression',
];

export const projects: Project[] = [
  {
    idx: '01',
    title: 'AI Video Dubbing Platform',
    slug: 'dubbing',
    summary:
      'Full-stack async video dubbing platform with job-based REST APIs and concurrent multi-language processing via asyncio.',
    cat: 'GenAI · Media',
    problem:
      'AI dubbing is long-running work — a single request can take minutes, which blocks the client and breaks on timeouts. Multi-language batch jobs needed to run concurrently without one failure sinking the rest.',
    solution:
      'Built a full-stack asynchronous platform with FastAPI and React/TypeScript, using job-based REST APIs and async polling for non-blocking AI processing. Concurrent multi-language jobs run with asyncio.gather and fault-isolated pipelines.',
    result:
      'Concurrent per-language processing significantly cuts batch turnaround. Frame-accurate ffmpeg editing, AI voice-track muxing, and automated SRT/VTT subtitle generation work end-to-end with no client timeouts.',
    tags: ['FastAPI', 'React/TypeScript', 'FFmpeg', 'asyncio'],
    flow: [
      { label: 'React UI', detail: 'Upload a video, choose target languages and follow job progress in real time.' },
      { label: 'Job API', detail: 'FastAPI creates a job and returns its ID immediately — no request is held open.' },
      { label: 'asyncio.gather', detail: 'Languages fan out concurrently; one failed language never sinks the rest (fault isolation).' },
      { label: 'FFmpeg pipeline', detail: 'Frame-accurate trimming and re-encoding; AI-cloned voice tracks muxed into the video.' },
      { label: 'SRT / VTT subs', detail: 'Automated multi-track subtitles generated for every target language.' },
    ],
    contribution: [
      'Built the full-stack async platform with FastAPI and React/TypeScript, using job-based REST APIs and async status polling for non-blocking AI processing.',
      'Implemented concurrent multi-language processing with asyncio.gather and an FFmpeg media pipeline for frame-accurate trimming, AI voice-track muxing, and automated SRT/VTT subtitle generation.',
    ],
    stack: [
      { label: 'Frontend', items: ['React', 'TypeScript'] },
      { label: 'Backend', items: ['FastAPI', 'REST APIs', 'asyncio'] },
      { label: 'Media & AI', items: ['FFmpeg', 'AI voice cloning', 'SRT/VTT'] },
    ],
  },  {
    idx: '02',
    title: 'Production RAG System',
    slug: 'rag',
    summary:
      'Production-style RAG with LangChain, FAISS IVF/HNSW indexing, cross-encoder re-ranking, and CI/CD pipelines.',
    cat: 'LLMs · Retrieval',
    problem:
      'Accurate, fast knowledge retrieval over documents at scale requires more than basic vector search — index quality, re-ranking precision, and production reliability all matter.',
    solution:
      'Built and deployed a production-style RAG system using LangChain, FAISS, and Ollama, exposed through FastAPI and containerized with Docker Compose for reproducible deployment.',
    result:
      'Optimized retrieval with FAISS IVF/HNSW indexing and cross-encoder re-ranking, improving Recall@k and query latency validated against a custom evaluation harness; added query caching, structured logging, and automated testing.',
    tags: ['LangChain', 'FAISS', 'Ollama', 'FastAPI', 'Docker'],
    flow: [
      { label: 'Documents', detail: 'Source documents are chunked and embedded with LangChain.' },
      { label: 'FAISS IVF / HNSW', detail: 'Approximate nearest-neighbour indexes replace Flat search for faster, scalable retrieval.' },
      { label: 'Cross-encoder re-rank', detail: 'Top candidates are re-scored for precision before being passed to the LLM.' },
      { label: 'Ollama LLM', detail: 'A locally hosted model generates a grounded, context-aware answer.' },
      { label: 'FastAPI + CI/CD', detail: 'Serves queries with query caching, structured logging, pytest, and GitHub Actions CI.' },
    ],
    contribution: [
      'Built and deployed a production-style RAG system using LangChain, FAISS, and Ollama, exposed through FastAPI and containerized with Docker Compose for reproducible deployment.',
      'Optimized retrieval with FAISS IVF/HNSW indexing and cross-encoder re-ranking, improving Recall@k and query latency based on a custom evaluation harness.',
      'Added query caching, structured logging, and automated testing with pytest and GitHub Actions CI.',
    ],
    stack: [
      { label: 'LLM & retrieval', items: ['LangChain', 'FAISS', 'Ollama', 'Cross-encoder'] },
      { label: 'Serving', items: ['FastAPI', 'Docker Compose'] },
      { label: 'Quality', items: ['pytest', 'GitHub Actions', 'Structured logging', 'Caching'] },
    ],
  },  {
    idx: '03',
    title: 'Triage Severity & ICU-Risk Classification System',
    slug: 'triage',
    summary:
      '5-class ESI triage ML pipeline with leakage prevention, XAI explainability, and a live FastAPI + React/Vite clinical dashboard.',
    cat: 'Healthcare ML',
    origin: 'Live · Render + Vercel',
    problem:
      'Emergency departments must sort patients by severity quickly, yet a model trained on leakage-prone features can look accurate while being clinically invalid — making feature selection a safety-critical task.',
    solution:
      'Built a 5-class ESI triage ML pipeline, removing 28+ leakage-prone features and evaluating Logistic Regression, Random Forest, and Gradient Boosting with stratified k-fold CV, weighted Cohen\'s Kappa, and error analysis.',
    result:
      'Deployed a FastAPI + React/Vite clinical dashboard with permutation feature importance (XAI), hosted on Render and Vercel with secured CORS configuration.',
    tags: ['Python', 'scikit-learn', 'FastAPI', 'React', 'Vite'],
    flow: [
      { label: 'Patient features', detail: '28+ leakage-prone features removed to ensure the model is clinically valid from the start.' },
      { label: 'Data diagnostics', detail: 'Automated correlation, inter-rater agreement, and outlier diagnostics.' },
      { label: 'Model selection', detail: 'Logistic Regression, Random Forest, and Gradient Boosting benchmarked with stratified k-fold CV and weighted Cohen\'s Kappa.' },
      { label: 'XAI explainability', detail: 'Permutation feature importance surfaces what drives each triage-level prediction.' },
      { label: 'React dashboard', detail: 'Decoupled FastAPI backend and React/Vite UI deployed on Render and Vercel with CORS-hardened access.' },
    ],
    contribution: [
      'Built a 5-class ESI triage ML pipeline, removing 28+ leakage-prone features and evaluating Logistic Regression, Random Forest, and Gradient Boosting with stratified k-fold CV, weighted Cohen\'s Kappa, and error analysis.',
      'Developed and deployed a FastAPI + React/Vite clinical dashboard with permutation feature importance (XAI), hosted on Render and Vercel with secured CORS configuration.',
    ],
    stack: [
      { label: 'ML', items: ['Python', 'scikit-learn', 'XGBoost', 'Explainable AI'] },
      { label: 'Backend', items: ['FastAPI', 'REST APIs'] },
      { label: 'Frontend & hosting', items: ['React', 'Vite', 'Render', 'Vercel'] },
    ],
  },  {
    idx: '04',
    title: 'Voice-Driven Lead Generation System',
    slug: 'voice-agent',
    summary:
      'End-to-end voice agent with multi-turn discovery, knowledge-grounded responses, and webhook tool calling that writes leads to Google Sheets.',
    cat: 'Voice AI · Agentic',
    problem:
      'Sales conversations hold the details that matter, but converting them into clean, structured lead records manually is slow, error-prone, and loses real-time visibility for the sales team.',
    solution:
      'Built an end-to-end voice-driven lead generation system with multi-turn customer discovery, FastAPI business logic, knowledge-grounded responses, and webhook-based tool calling to convert conversations into structured lead records.',
    result:
      'Integrated Pydantic validation and Google Sheets API with OAuth2 for reliable lead persistence and real-time sales visibility, using a modular, provider-agnostic architecture for scalable integrations.',
    tags: ['ElevenLabs', 'FastAPI', 'Google Sheets API', 'Pydantic'],
    flow: [
      { label: 'ElevenLabs voice', detail: 'Multi-turn customer discovery with knowledge-grounded responses for accurate, context-aware conversations.' },
      { label: 'Webhook tool call', detail: 'The agent calls tools over webhooks mid-conversation to trigger business logic.' },
      { label: 'FastAPI + Pydantic', detail: 'Business logic layer validates every field with Pydantic before persisting — safeguarding voice-to-data accuracy.' },
      { label: 'Google Sheets', detail: 'OAuth2 pipeline writes each structured lead for real-time sales visibility.' },
    ],
    contribution: [
      'Built an end-to-end voice-driven lead generation system with multi-turn customer discovery, FastAPI business logic, knowledge-grounded responses, and webhook-based tool calling to convert conversations into structured lead records.',
      'Integrated Pydantic validation and Google Sheets API with OAuth2 for reliable lead persistence and real-time sales visibility, using a modular, provider-agnostic architecture for scalable integrations.',
    ],
    stack: [
      { label: 'Voice AI', items: ['ElevenLabs', 'Knowledge retrieval', 'Tool calling'] },
      { label: 'Backend', items: ['FastAPI', 'Pydantic', 'Webhooks'] },
      { label: 'Data', items: ['Google Sheets API', 'OAuth2'] },
    ],
  },  {
    idx: '05',
    slug: 'coronary',
    summary:
      'Voting ensemble of Random Forest, XGBoost and SVM for coronary artery disease prediction.',
    title: 'Coronary Artery Disease Prediction using Voting Ensemble',
    cat: 'Healthcare ML',
    problem:
      'Predicting coronary artery disease reliably is hard when medical datasets are imbalanced and a single model is easily biased.',
    solution:
      'A two-layer ensemble framework that combines Random Forest, XGBoost and SVM classifiers through voting.',
    result:
      'Improved prediction accuracy by approximately 7–10% compared with the individual models.',
    tags: ['Python', 'Scikit-learn', 'XGBoost', 'Ensemble'],
    flow: [
      { label: 'Medical dataset', detail: 'Patient records, with the class imbalance taken into account.' },
      { label: 'Random Forest', detail: 'First base classifier in the ensemble.' },
      { label: 'XGBoost', detail: 'Gradient-boosted trees as the second base classifier.' },
      { label: 'SVM', detail: 'Support vector machine as the third base classifier.' },
      { label: 'Voting ensemble', detail: 'The three models vote on the final prediction.' },
    ],
    contribution: [
      'Built a two-layer ensemble framework combining Random Forest, XGBoost and SVM classifiers.',
      'Designed it to predict coronary artery disease reliably from imbalanced medical data.',
      'Improved accuracy by approximately 7–10% over each individual model.',
    ],
    stack: [
      { label: 'ML', items: ['Scikit-learn', 'XGBoost', 'SVM', 'Random Forest'] },
      { label: 'Technique', items: ['Voting ensemble', 'Imbalanced data'] },
      { label: 'Language', items: ['Python'] },
    ],
  },
  {
    idx: '06',
    title: 'Pneumonia Detection from Chest X-Ray Images',
    slug: 'pneumonia',
    summary:
      'Deep CNN with CLAHE preprocessing that detects pneumonia in chest X-rays.',
    cat: 'Deep Learning · Vision',
    problem:
      'Reading chest X-rays for pneumonia takes expert time, and low-contrast images make subtle cases easy to miss.',
    solution:
      'A deep convolutional neural network in Keras that screens chest X-rays, with CLAHE contrast enhancement in preprocessing.',
    result:
      'CLAHE preprocessing improved recall and sensitivity by about 9%, with consistent performance across validation experiments.',
    tags: ['Keras', 'Deep CNN', 'CLAHE', 'Python'],
    flow: [
      { label: 'Chest X-ray', detail: 'Chest radiographs form the model input.' },
      { label: 'CLAHE', detail: 'Contrast-limited adaptive histogram equalization brings out lung detail.' },
      { label: 'Deep CNN', detail: 'Convolutional layers learn the visual patterns of infection.' },
      { label: 'Detection', detail: 'Each X-ray is flagged for pneumonia.' },
    ],
    contribution: [
      'Built a deep CNN in Keras for automated pneumonia detection from chest X-ray images.',
      'Added CLAHE preprocessing to enhance local contrast, raising recall and sensitivity by about 9%.',
      'Validated across repeated experiments for consistent classification performance.',
    ],
    stack: [
      { label: 'Deep learning', items: ['Keras', 'Deep CNN'] },
      { label: 'Image processing', items: ['CLAHE'] },
      { label: 'Language', items: ['Python'] },
    ],
  },];

export const timeline: TimelineEntry[] = [
  {
    period: 'Feb 2026 – Present',
    role: 'Research Associate · Agentic AI & Edge AI',
    company: 'ReyraAI',
    location: 'Kozhikode, Kerala',
    current: true,
    summary:
      'Research that makes AI smaller, more autonomous and safer to deploy.',
    highlights: [
      'Shrank deep-learning models and accelerated their inference on low-power hardware with minimal accuracy loss.',
      'Built the benchmarking framework that decides which architecture ships to each device.',
      'Developing agentic AI systems that automate complex decision-making and substantially reduce manual intervention.',
      'Explored machine unlearning, which removes the influence of specific training data without full retraining, to support compliance and privacy-preserving deployment.',
    ],
    tags: ['Edge AI', 'Model Compression', 'Agentic AI', 'Machine Unlearning'],
  },
  {
    period: 'Oct 2025 – Dec 2025',
    role: 'Data Annotation Specialist',
    company: 'Iva Technos',
    location: 'Coimbatore',
    summary: 'Built the ground truth that autonomous-driving perception models learn from.',
    highlights: [
      'Became productive quickly on GT Studio’s advanced annotation workflows.',
      'Kept label quality consistent across 3D bounding boxes, semantic segmentation, lane marking and multi-class labeling.',
    ],
    tags: ['GT Studio', 'Computer Vision', '3D Annotation', 'Semantic Segmentation'],
  },
  {
    period: 'Jun 2025 – Aug 2025',
    role: 'Data Science & AI Trainer',
    company: 'Maitexa Technology',
    location: 'Kozhikode',
    summary: 'Prepared students for practical data science work.',
    highlights: [
      'Ran hands-on sessions covering Python, data analysis, machine learning and deep learning.',
      'Mentored students through the full model workflow: preprocessing, feature engineering, visualization and evaluation.',
    ],
    tags: ['Python', 'Machine Learning', 'Deep Learning', 'Mentoring'],
  },
];

export const education: Education[] = [
  {
    degree: 'Master of Science',
    field: 'Computer Science (Intelligent Systems)',
    school: 'Central University of Kerala',
    period: 'Jul 2023 – Jun 2025',
  },
  {
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    school: 'Mahatma Gandhi College, Iritty · Kannur University',
    period: 'May 2019 – May 2022',
  },
];

export const stats: Stat[] = [
  { num: 7, suffix: '+', label: 'Projects delivered' },
  { num: 200, suffix: '+', label: 'Students trained in AI' },
];

export const cvHref = '/Ayana_KK_CV.pdf';

export interface Social {
  label: string;
  href: string;
  icon: 'linkedin' | 'gmail';
}

export const socials: Social[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ayana-k-k-513a76247', icon: 'linkedin' },
  { label: 'Gmail', href: 'mailto:ayanakkpattari@gmail.com', icon: 'gmail' },
];

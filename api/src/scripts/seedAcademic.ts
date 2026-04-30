import { supabase } from '../config/supabase';

const academicData = [
  {
    faculty: "Faculty of Applied Science",
    programs: [
      {
        name: "MSc in Applied Microbiology and Biotechnology",
        level: "Postgraduate",
        modules: [
          { code: "SBB 5102", name: "Recombinant DNA Technology" },
          { code: "SBB 5101", name: "Microbial Genetics" },
          { code: "SBB 6116", name: "Immunology" },
          { code: "SBB 6114", name: "Environmental Biotechnology" },
          { code: "SBB 5111", name: "Environmental Microbiology" },
          { code: "SBB 6117", name: "Virology" },
          { code: "SBB 6110", name: "Industrial Biotechnology" },
          { code: "SBB 5204", name: "Advanced Food Microbiology" },
          { code: "SBB 5213", name: "Medical Microbiology and Biotechnology" }
        ]
      },
      {
        name: "MSc in Applied Geographical Information Science and Remote Sensing",
        level: "Postgraduate",
        modules: [
          { code: "EGR 5101", name: "Geographic Information Science Theory and Practice" },
          { code: "EGR 5104", name: "Unmanned Aerial Vehicle Systems" },
          { code: "EGR 5110", name: "Spatial Database Design" },
          { code: "EGR 5105", name: "Remote Sensing of Global Environmental Change" },
          { code: "EGR 5102", name: "Remote Sensing and Digital Image Processing" },
          { code: "EGR 5204", name: "Advanced GIS Analysis" },
          { code: "EGR 5103", name: "Research Methods for Spatial Scientists" }
        ]
      },
      {
        name: "MSc in Applied Mathematical Modelling",
        level: "Postgraduate",
        modules: [
          { code: "SMA 5191", name: "Mathematical Modelling" },
          { code: "SMA 5281", name: "Stochastic Differential Equations" },
          { code: "SMA 5282", name: "Financial Mathematics" },
          { code: "SMA 5253", name: "Forecasting" }
        ]
      },
      {
        name: "MSc in Big Data",
        level: "Postgraduate",
        modules: [
          { code: "SIDS 5101", name: "Big Data Analytics" },
          { code: "SIDS 5102", name: "Programming for Data Science" },
          { code: "SIDS 5104", name: "Big Data Science Research Methods" },
          { code: "SIDS 5203", name: "Big Data Visualisation" },
          { code: "SIDS 5201", name: "Big Data Project Management" },
          { code: "SIDS 5202", name: "Machine Learning" }
        ]
      },
      {
        name: "MSc in Computer Science",
        level: "Postgraduate",
        modules: [
          { code: "SCS 5102", name: "Computational Discrete Mathematics" },
          { code: "SCS 5103", name: "Pattern Recognition and Image Processing" },
          { code: "SCS 5109", name: "Advanced Database and Data Mining" },
          { code: "SCS 5107", name: "Enterprise Architecture Programming" },
          { code: "SCS 5205", name: "Software Methodology" },
          { code: "SCS 5207", name: "Numerical and Symbolic Computation" },
          { code: "SCS 5208", name: "Evolutionary Computing" },
          { code: "SCS 5209", name: "Research Methods" }
        ]
      },
      {
        name: "MSc in Climate Change and Sustainable Development",
        level: "Postgraduate",
        modules: [
          { code: "EEH 6102", name: "Climate and Environmental Change" }
        ]
      },
      {
        name: "MSc in Eco-Tourism and Biodiversity Conservation",
        level: "Postgraduate",
        modules: [
          { code: "EFW 5101", name: "Principles of Eco-Tourism" },
          { code: "EFW 5102", name: "Biodiversity Conservation" },
          { code: "EFW 5103", name: "Strategic Environmental Management" },
          { code: "EFW 5104", name: "Plant and Animal Taxonomy" }
        ]
      },
      {
        name: "MSc in Environmental Health",
        level: "Postgraduate",
        modules: [
          { code: "EEH 5101", name: "Food Safety Management" },
          { code: "EEH 5103", name: "Communicable Diseases" },
          { code: "EEH 5102", name: "Environmental Protection and Health" },
          { code: "EEH 5104", name: "Housing and Health" },
          { code: "EEH 6101", name: "Health Systems Management" },
          { code: "EEH 6204", name: "One Health" },
          { code: "EEH 6205", name: "Non-Communicable Diseases" }
        ]
      },
      {
        name: "MSc in Geophysics",
        level: "Postgraduate",
        modules: [
          { code: "MAPH 5236", name: "Geophysical Inverse Theory" },
          { code: "MAPH 5220", name: "Safety and Quality Management" },
          { code: "MAPH 5237", name: "Geoelectric and EM Methods" },
          { code: "MAPH 5238", name: "Gravity and Magnetic Exploration" },
          { code: "MAPH 5239", name: "Refraction and Reflection Seismology" }
        ]
      },
      {
        name: "MSc in Medical Physics",
        level: "Postgraduate",
        modules: [
          { code: "MAPH 5221", name: "Physics of Non-Ionising Radiation" },
          { code: "MAPH 5222", name: "Medical Electronics and Instrumentation" },
          { code: "MAPH 5225", name: "Nuclear Medicine" }
        ]
      },
      {
        name: "MSc in Medical Ultrasound",
        level: "Postgraduate",
        modules: [
          { code: "SRU 5101", name: "Ultrasound Physics and Instrumentation" },
          { code: "SRU 5102", name: "Ethics in Ultrasound" },
          { code: "SRU 5103", name: "Pelvic and Obstetric Ultrasound I" },
          { code: "SRU 5203", name: "The Pelvis and Obstetric Ultrasound II" },
          { code: "SRU 5204", name: "The Upper Abdomen Ultrasound" },
          { code: "SRU 5205", name: "Small Parts, Musculoskeletal and Vascular Ultrasound" },
          { code: "SRU 6111", name: "Entrepreneurship and Quality Management" }
        ]
      },
      {
        name: "MSc in Operations Research and Statistics",
        level: "Postgraduate",
        modules: [
          { code: "SORS 6101", name: "Applications of Quantitative Analysis" },
          { code: "SORS 5101", name: "Operations Management" },
          { code: "SORS 6102", name: "Forecasting" },
          { code: "SORS 5103", name: "Industrial Statistics" },
          { code: "SORS 6103", name: "Financial Modelling" },
          { code: "SORS 5102", name: "Stochastic Modelling" },
          { code: "SORS 5202", name: "Simulation Modelling" },
          { code: "SORS 6202", name: "Network Optimisation" },
          { code: "SORS 5104", name: "Computational Statistics" }
        ]
      },
      {
        name: "BSc Honours in Applied Biology/Biotechnology",
        level: "Undergraduate",
        modules: [
          { code: "SBB 1208", name: "Chemistry of Biomolecules" },
          { code: "SBB 2211", name: "Principles of Quality Assurance" },
          { code: "SBT 1201", name: "Introduction to Biotechnology" },
          { code: "SBT 2201", name: "Research Methods and Statistics" },
          { code: "SBT 2203", name: "Recombinant DNA Technology" },
          { code: "SBB 5212", name: "Analytical Biotechnology and Bioinformatics" },
          { code: "SBB 5214", name: "Entrepreneurial Skills" }
        ]
      },
      {
        name: "BSc Honours in Computer Science",
        level: "Undergraduate",
        modules: [
          { code: "SCS 1101", name: "Introduction to Computer Science" },
          { code: "SCS 1214", name: "Software Engineering" },
          { code: "SCS 1217", name: "Data Structures and Algorithms" },
          { code: "SCS 1211", name: "Data Concepts and Processes" },
          { code: "SCS 1215", name: "Ethics and Professionalism" },
          { code: "SCS 2212", name: "Design and Analysis of Algorithms" },
          { code: "SCS 2214", name: "Group Project" },
          { code: "SCS 2211", name: "Software Project Management" }
        ]
      },
      {
        name: "BSc Honours in Informatics",
        level: "Undergraduate",
        modules: [
          { code: "SIA 2204", name: "Information Security and Auditing" },
          { code: "SIA 2201", name: "Decision Support Systems" },
          { code: "SIA 2202", name: "Parallel and Distributed Processing" },
          { code: "SIA 1202", name: "Data Mining and Data Warehousing" }
        ]
      },
      {
        name: "BSc Honours in Sport Science and Coaching",
        level: "Undergraduate",
        modules: [
          { code: "SSC 1204", name: "Sports Coaching Concepts" },
          { code: "SSC 2232", name: "Tests and Evaluation in Sports" },
          { code: "SSC 2230", name: "Research Methods in Sports Science" },
          { code: "SSC 2228", name: "Swimming" },
          { code: "SSC 1230", name: "Motor Learning and Control" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Business and Economic Sciences",
    programs: [
      {
        name: "BCom Honours in Accounting",
        level: "Undergraduate",
        modules: [
          { code: "CAC 1202", name: "Financial Accounting IB" },
          { code: "CAC 2201", name: "Financial Accounting IIB" },
          { code: "CAC 1212", name: "Financial Accounting for Business" },
          { code: "CAC 1214", name: "Introduction to Financial Accounting" },
          { code: "CAC 1208", name: "Accounting IB" },
          { code: "CAC 2203", name: "Audit Process" },
          { code: "CAC 2205", name: "Management and Cost Accounting IIB" },
          { code: "CAC 2207", name: "Research Methods" },
          { code: "CAC 1203", name: "Introduction to Information Technology" }
        ]
      },
      {
        name: "BCom Honours in Actuarial Science",
        level: "Undergraduate",
        modules: [
          { code: "SMA 1201", name: "Calculus of Several Variables" },
          { code: "CIN 2222", name: "Life Contingencies I" }
        ]
      },
      {
        name: "BCom Honours in Banking",
        level: "Undergraduate",
        modules: [
          { code: "CFS 2207", name: "Public Finance and Economics" },
          { code: "CBA 2212", name: "International Banking" }
        ]
      },
      {
        name: "BCom Honours in Finance",
        level: "Undergraduate",
        modules: [
          { code: "CBA 5302", name: "Financial Engineering" },
          { code: "CBA 5101", name: "Financial Markets and Regulations" },
          { code: "CBA 5303", name: "Applied International Banking and Finance" },
          { code: "CBA 5102", name: "Financial Econometrics" },
          { code: "CBA 5110", name: "Risk Management and Corporate Governance" },
          { code: "CBA 5109", name: "Bank Operations and Strategy" },
          { code: "CBA 5304", name: "Strategic Financial Management" },
          { code: "CBA 5305", name: "Development Finance" },
          { code: "CBA 5106", name: "Marketing of Financial Services" },
          { code: "CBA 2210", name: "Derivative Securities" },
          { code: "CEC 2204", name: "Macro Economics I" },
          { code: "CEC 2205", name: "Macro Econometrics I" }
        ]
      },
      {
        name: "BCom Honours in Insurance and Risk Management",
        level: "Undergraduate",
        modules: [
          { code: "CBA 2211", name: "Fundamentals of Risk Analysis" },
          { code: "CIN 2219", name: "Health and Disability Insurance" },
          { code: "CIN 1202", name: "Risk and Insurance" },
          { code: "CIN 2218", name: "Retirement Funding" },
          { code: "CIN 2217", name: "Reinsurance" }
        ]
      },
      {
        name: "BCom Honours in Marketing",
        level: "Undergraduate",
        modules: [
          { code: "CMK 2201", name: "Distribution and Logistics" },
          { code: "CMK 2204", name: "Sales Management" },
          { code: "CMK 2207", name: "Retail Marketing Management" },
          { code: "CMK 1209", name: "Principles of Marketing" }
        ]
      },
      {
        name: "Bachelor of Business Studies / Commerce (General)",
        level: "Undergraduate",
        modules: [
          { code: "CBU 2207", name: "Labour Law" },
          { code: "CBU 2213", name: "Entrepreneurship Theory & Practice" },
          { code: "CBU 2209", name: "Business Research Methods" },
          { code: "CBU 1203", name: "Introduction to Computers" },
          { code: "CBU 2115", name: "Entrepreneurship Skills" }
        ]
      },
      {
        name: "BCom Honours in Financial Informatics",
        level: "Undergraduate",
        modules: [
          { code: "CFI 2207", name: "Introduction to Financial Computing" },
          { code: "CFI 1203", name: "Financial Markets and Regulations" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of the Built Environment",
    programs: [
      {
        name: "BSc Honours in Architecture",
        level: "Undergraduate",
        modules: [
          { code: "BAR 2208", name: "Housing I" },
          { code: "BCS 1202", name: "Principles of Construction Law" }
        ]
      },
      {
        name: "BSc Honours in Construction Management",
        level: "Undergraduate",
        modules: [
          { code: "SHE 3102", name: "Safety, Health and Environment" },
          { code: "BCM 2203", name: "Construction Technology III" },
          { code: "BCM 2202", name: "Theory and Practice of Construction Management II" },
          { code: "BLP 1206", name: "Principles of Town Planning" },
          { code: "BQS 2208", name: "Aspects of Construction Economics" }
        ]
      },
      {
        name: "BSc Honours in Property Development and Estate Management",
        level: "Undergraduate",
        modules: [
          { code: "BLP 1205", name: "Land Economics" },
          { code: "BLP 2213", name: "Techniques of Gathering Data" },
          { code: "BLP 2212", name: "Aspects of Property Management" },
          { code: "BLP 2210", name: "Advanced Property Law" }
        ]
      },
      {
        name: "BSc Honours in Quantity Surveying",
        level: "Undergraduate",
        modules: [
          { code: "BQS 2205", name: "Theory and Practice of Quantity Surveying II" },
          { code: "BLP 1202", name: "Principles of Construction Law" },
          { code: "BQS 2202", name: "Research Skills" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Communication and Information Science",
    programs: [
      {
        name: "BSc Honours in Records and Archives Management",
        level: "Undergraduate",
        modules: [
          { code: "IIM 1201", name: "Archives and Manuscripts Management I" },
          { code: "IIM 2201", name: "Digital Recordkeeping Systems II" },
          { code: "IIM 1202", name: "Management of Records Centres" },
          { code: "IIM 2204", name: "Archival Informatics" },
          { code: "IIM 1205", name: "Computer Applications in Information Centres" },
          { code: "IIM 2203", name: "Research Methods in Information Management" }
        ]
      },
      {
        name: "BSc Honours in Journalism and Media Studies",
        level: "Undergraduate",
        modules: [
          { code: "IJM 1211", name: "Media Law" },
          { code: "IJM 2212", name: "Applied Media Research Methods" },
          { code: "IJM 1212", name: "Media Ethics" },
          { code: "IJM 2216", name: "Online Journalism" },
          { code: "IJM 2214", name: "Fundamentals of Film and Video Production" },
          { code: "IJM 2220", name: "Feature Writing I" },
          { code: "IJM 1223", name: "News Writing" }
        ]
      },
      {
        name: "BSc Honours in Library and Information Science",
        level: "Undergraduate",
        modules: [
          { code: "ILI 1202", name: "Information Sources and Services" },
          { code: "ILI 1209", name: "Theory and Practice of Cataloguing" },
          { code: "ILI 1210", name: "Information Ethics" },
          { code: "ILI 5101", name: "Advanced Information Technology Applications" },
          { code: "ILI 5102", name: "Research Methods" },
          { code: "ILI 5112", name: "Knowledge Management" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Medicine",
    programs: [
      {
        name: "Bachelor of Medicine and Bachelor of Surgery (MBBS)",
        level: "Undergraduate",
        modules: [
          { code: "MBM 3001", name: "Haematology" },
          { code: "MBM 3001", name: "Histopathology" },
          { code: "MBM 3001", name: "Chemical Pathology" },
          { code: "MBM 3001", name: "Immunology" },
          { code: "MBM 3001", name: "Medical Microbiology" },
          { code: "MBM 1002", name: "Anatomy I" },
          { code: "MBM 2005", name: "Anatomy II" },
          { code: "MBM 1003", name: "Physiology I" },
          { code: "MBM 2003", name: "Physiology II" },
          { code: "MBM 1205", name: "Biochemistry II" },
          { code: "MBM 2206", name: "Basic Pharmacology" },
          { code: "MCP 4004", name: "Psychiatry I" },
          { code: "MCP 4005", name: "Psychiatry II" },
          { code: "MCP 4003", name: "Community Medicine I" },
          { code: "MCP 4006", name: "Clinical Pharmacology I" },
          { code: "SBS 1201", name: "Introduction to Heritage-Based Medicine" },
          { code: "MBM 2105", name: "Biomedical Innovation" },
          { code: "MBM 2202", name: "Data Sciences, Robotics and AI" }
        ]
      },
      {
        name: "BSc in Nursing",
        level: "Undergraduate",
        modules: [
          { code: "BSN 2203", name: "Clinical Assessments - Aseptic Technique" },
          { code: "BSN 1201", name: "Applied Biophysics" },
          { code: "BSN 2201", name: "Emerging Infections" },
          { code: "BSN 1202", name: "Applied Biochemistry" },
          { code: "BSN 2202", name: "Health Assessment Theory and Practice" },
          { code: "BSN 2203", name: "Clinical Practice in Medical-Surgical Nursing I" },
          { code: "BSN 1203", name: "Professional and Legal Aspects of Nursing" },
          { code: "BSN 1204", name: "Sociology" },
          { code: "BSN 1205", name: "Psychology" }
        ]
      },
      {
        name: "BSc in Biomedical Sciences",
        level: "Undergraduate",
        modules: [
          { code: "MBM 3001", name: "Haematology" },
          { code: "MBM 3001", name: "Histopathology" },
          { code: "MBM 3001", name: "Chemical Pathology" },
          { code: "MBM 3001", name: "Immunology" },
          { code: "MBM 3001", name: "Medical Microbiology" },
          { code: "MBM 2005", name: "Anatomy II" },
          { code: "MBM 2003", name: "Physiology II" }
        ]
      },
      {
        name: "BSc in Health Information Management",
        level: "Undergraduate",
        modules: [
          { code: "CTL 1101", name: "Conflict Transformation and Leadership" },
          { code: "HIM 1104", name: "Health Policy and Governance" },
          { code: "HIM 1101", name: "Communication Skills" },
          { code: "HIM 1105", name: "Health Record Content" },
          { code: "ILI 1111", name: "IT and Information Literacy" },
          { code: "HIM 1106", name: "Health Care Patient and Data Systems" }
        ]
      },
      {
        name: "M Med in Family Medicine",
        level: "Postgraduate",
        modules: [
          { code: "MFM 1002", name: "General Adult Medicine" },
          { code: "MFM 1006", name: "Women's Health" },
          { code: "MFM 2005", name: "Anaesthetics and Critical Care" },
          { code: "MFM 1001", name: "New-born and Child Health" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Environmental Science",
    programs: [
      {
        name: "MSc in Disaster Risk Management",
        level: "Postgraduate",
        modules: [
          { code: "MDM 5301", name: "GIS for Disaster Risk Management" },
          { code: "MDM 5101", name: "Hazards and Zimbabwe Emergency Management" },
          { code: "MDM 5302", name: "Emergency Planning" },
          { code: "MDM 5102", name: "Disaster Vulnerability & Risk Management" },
          { code: "MDM 5303", name: "Public Health in Disaster Management" },
          { code: "MDM 5103", name: "Disaster Education" },
          { code: "MDM 5304", name: "Disaster Risk Regulation" },
          { code: "MDM 5104", name: "Media and Disaster Communication" },
          { code: "MDM 5305", name: "Urban Disaster Risk Management" },
          { code: "MDM 5105", name: "Community Based DRR" }
        ]
      },
      {
        name: "MSc in Development Studies",
        level: "Postgraduate",
        modules: [
          { code: "MDS 5305", name: "GIS for Development Studies" },
          { code: "MDS 5101", name: "Development Theory, Policy and Practice" },
          { code: "MDS 5301", name: "Management of Development Institutions" },
          { code: "MDS 5102", name: "Development Economics" },
          { code: "MDS 5302", name: "Dimensions of Poverty Reduction" },
          { code: "MDS 5103", name: "Governance and Development" },
          { code: "MDS 5303", name: "Civil Society and Development" },
          { code: "MDS 5104", name: "Natural Environment and Development" },
          { code: "MDS 5304", name: "Social and Political Change" },
          { code: "MDS 5105", name: "Gender and Development" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Science and Technology Education",
    programs: [
      {
        name: "Bachelor of Education (Various STEM subjects)",
        level: "Undergraduate",
        modules: [
          { code: "PST 1112", name: "ICT Application in Education" },
          { code: "PST 2105", name: "Testing, Assessment and Evaluation" },
          { code: "PST 1163", name: "Entrepreneurship and Financial Management" },
          { code: "PST 1118", name: "Culture and Heritage Studies" },
          { code: "PST 1101", name: "Theoretical Foundations in STEM Education" },
          { code: "PST 1161", name: "Principles of Management" },
          { code: "PST 1136", name: "Biochemistry II" },
          { code: "PST 1133", name: "Mathematical Foundations of Computer Science" },
          { code: "PST 1233", name: "Probability Theory" },
          { code: "PST 2176", name: "Database Concepts" },
          { code: "PST 2175", name: "Object Oriented Programming I" },
          { code: "PST 1331", name: "Calculus" },
          { code: "PST 2179", name: "Software Engineering" },
          { code: "PST 2161", name: "Human Resources Management" }
        ]
      },
      {
        name: "Postgraduate Diploma / MSc in Higher Education",
        level: "Postgraduate",
        modules: [
          { code: "PTE 5113", name: "E-Learning in Higher Education" },
          { code: "PTE 5208", name: "Leadership in Higher Education" },
          { code: "PTE 5118", name: "Higher Education Context" },
          { code: "PTE 5101", name: "Educational Foundations" },
          { code: "PTE 5302", name: "Quality and Innovation in Higher Education" },
          { code: "PTE 5102", name: "Scholarship in Further and Higher Education" },
          { code: "PTE 5112", name: "Research in Higher Education" },
          { code: "PTE 5304", name: "Curriculum Design and Review" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Engineering",
    programs: [
      {
        name: "BSc Honours in Agricultural Engineering",
        level: "Undergraduate",
        modules: [
          { code: "AAE 1205", name: "Introduction to Computer Aided Design" },
          { code: "AAE 1201", name: "Engineering Mechanics" },
          { code: "AAE 1204", name: "Engineering Research Methods" },
          { code: "AAE 1203", name: "Introduction to Manufacturing Processes" }
        ]
      },
      {
        name: "BSc Honours in Chemical Engineering",
        level: "Undergraduate",
        modules: [
          { code: "ECE 1205", name: "Computation Methods for Chemical Engineers" },
          { code: "ECE 2208", name: "Reactor Analysis and Design" },
          { code: "ECE 2207", name: "Instrumentation and Process Control" }
        ]
      },
      {
        name: "BSc Honours in Civil and Water Engineering",
        level: "Undergraduate",
        modules: [
          { code: "SCS 1212", name: "Computer Applications and Programming" },
          { code: "ECW 2201", name: "Geo Mechanics" },
          { code: "ECW 2204", name: "Engineering Survey II" },
          { code: "ECW 2206", name: "Structural Analysis I" }
        ]
      },
      {
        name: "BSc Honours in Electronic Engineering",
        level: "Undergraduate",
        modules: [
          { code: "EEE 1231", name: "Software Engineering" },
          { code: "EEE 2233", name: "Object Oriented Programming" },
          { code: "EEE 2215", name: "Analogue Electronics II" },
          { code: "EEE 1232", name: "CAD for Electronic Engineers" }
        ]
      },
      {
        name: "BSc Honours in Industrial and Manufacturing Engineering",
        level: "Undergraduate",
        modules: [
          { code: "EIE 1201", name: "Engineering Drawing II" },
          { code: "EIE 1206", name: "Applied Mechanics" },
          { code: "EIE 2202", name: "Fluid Mechanics" },
          { code: "EIE 2203", name: "Solid Mechanics II" },
          { code: "EIE 1203", name: "Workshop Technology" },
          { code: "EIE 2213", name: "Material Technology" }
        ]
      }
    ]
  },
  {
    faculty: "Faculty of Agricultural Science and Technology",
    programs: [
      {
        name: "BSc Honours in Agricultural Information Technology",
        level: "Undergraduate",
        modules: [
          { code: "AIT 1202", name: "Data Structures and Algorithms" },
          { code: "AEM 1201", name: "Agricultural Statistics" }
        ]
      },
      {
        name: "BSc Honours in Agribusiness",
        level: "Undergraduate",
        modules: [
          { code: "AEM 1202", name: "Microeconomics for Agriculture" },
          { code: "AEM 1203", name: "Financial Accounting and Agribusiness Records" }
        ]
      },
      {
        name: "BSc Honours in Animal Production",
        level: "Undergraduate",
        modules: [
          { code: "AFP 1203", name: "Cropping Systems" },
          { code: "AFP 1204", name: "Seed Production" }
        ]
      },
      {
        name: "BSc Honours in Crop Science",
        level: "Undergraduate",
        modules: [
          { code: "AGC 1202", name: "Biochemistry and Molecular Biology" },
          { code: "AGC 1204", name: "Plant Growth and Development" }
        ]
      }
    ]
  }
];

async function seed() {
  console.log('🚀 Starting seed...');

  for (const f of academicData) {
    console.log(`- Seeding Faculty: ${f.faculty}`);
    
    // 1. Insert Faculty
    const { data: faculty, error: fError } = await supabase
      .from('faculties')
      .upsert({ name: f.faculty }, { onConflict: 'name' })
      .select()
      .single();

    if (fError) {
      console.error(`Error inserting faculty ${f.faculty}:`, fError);
      continue;
    }

    for (const p of f.programs) {
      console.log(`  - Seeding Program: ${p.name}`);
      
      // 2. Insert Program
      const { data: program, error: pError } = await supabase
        .from('programs')
        .upsert({ 
          faculty_id: faculty.id, 
          name: p.name, 
          level: p.level 
        }, { onConflict: 'name' })
        .select()
        .single();

      if (pError) {
        console.error(`Error inserting program ${p.name}:`, pError);
        continue;
      }

      for (const m of p.modules) {
        // 3. Insert Module (we don't unique by name across all programs, but let's try to avoid exact duplicates)
        const { data: module, error: mError } = await supabase
          .from('modules')
          .upsert({ 
            code: m.code, 
            name: m.name 
          }, { onConflict: 'code,name' }) // This requires a unique constraint on code and name
          .select()
          .single();

        if (mError) {
          // If the unique constraint fails or doesn't exist, we might get an error.
          // Let's just try to insert and ignore conflict if it's already there.
          const { data: existingModule, error: getError } = await supabase
            .from('modules')
            .select()
            .eq('code', m.code)
            .eq('name', m.name)
            .maybeSingle();
          
          if (getError || !existingModule) {
            console.error(`Error with module ${m.name}:`, mError || getError);
            continue;
          }
          
          // Link existing module
          await supabase.from('program_modules').upsert({
            program_id: program.id,
            module_id: existingModule.id
          }).select();
        } else {
          // 4. Link Module to Program
          await supabase.from('program_modules').upsert({
            program_id: program.id,
            module_id: module.id
          });
        }
      }
    }
  }

  console.log('✅ Seeding complete!');
}

seed().catch(console.error);

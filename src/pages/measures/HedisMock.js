import _ from 'lodash';

const measures = [{
  code: 'W15',
  name: 'Well-Child Visits in the First 15 Months of Life (W15)',
  description: '<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/24015/wellchild-visits-in-the-first-15-months-of-life-percentage-of-members-who-turned-15-months-old-during-the-measurement-year-and-who-had-the-following-number-of-wellchild-visits-with-a-primary-care-practitioner-pcp-during-their-first-15-months-of-life-zero-one-t#">Description</a></h3><div><p>This measure is used to assess the percentage of members who turned 15 months old during the measurement year who had the following number of well-child visit with a primary care practitioner (PCP) during their first 15 months of life.</p><ul><li>No well-child visits</li><li>One well-child visit</li><li>Two well-child visits</li><li>Three well-child visits</li><li>Four well-child visits</li><li>Five well-child visits</li><li>Six or more well-child visits</li></ul></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/24015/wellchild-visits-in-the-first-15-months-of-life-percentage-of-members-who-turned-15-months-old-during-the-measurement-year-and-who-had-the-following-number-of-wellchild-visits-with-a-primary-care-practitioner-pcp-during-their-first-15-months-of-life-zero-one-t#">Rationale</a></h3><div><p>This measure looks at the adequacy of well-child care for infants. It measures the percentage of children who had one, two, three, four, five, six or more well-child visits by the time they turned 15 months of age.</p><p>Regular check-ups are one of the best ways to detect physical, developmental, behavioral and emotional problems. They also provide an opportunity for the clinician to offer guidance and counseling to the parents.</p><p>These visits are of particular importance during the first year of life, when an infant undergoes substantial changes in abilities, physical growth, motor skills, hand-eye coordination and social and emotional growth. The American Academy of Pediatrics (AAP) recommends six well-child visits in the first year of life: the first within the first month of life, and then at around 2, 4, 6, 9, and 12 months of age.</p></div><h3>&nbsp;</h3>'
}, {
  code: 'BMI',
  name: 'Adult BMI Assessment',
  description: `<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/48797/adult-body-mass-index-bmi-assessment-percentage-of-patients-18-to-74-years-of-age-who-had-an-outpatient-visit-and-whose-bmi-was-documented-during-the-measurement-year-or-the-year-prior-to-the-measurement-year#">Description</a></h3><div class="content_para"><p>This measure is used to assess the percentage of patients 18 to 74 years of age who had an outpatient visit and whose body mass index (BMI) was documented during the measurement year or the year prior to the measurement year.</p></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/48797/adult-body-mass-index-bmi-assessment-percentage-of-patients-18-to-74-years-of-age-who-had-an-outpatient-visit-and-whose-bmi-was-documented-during-the-measurement-year-or-the-year-prior-to-the-measurement-year#">Rationale</a></h3><div class="content_para"><p>Obesity is the second leading cause of preventable death in the United States (U.S.). It is a complex, multifaceted, chronic disease that is affected by environmental, genetic, physiological, metabolic, behavioral and psychological components. Approximately 127 million American adults are overweight, 60 million are obese and 9 million are severely obese (American Obesity Association [AOA], 2005). Obesity affects every ethnicity, socioeconomic class and geographic region in the U.S. This disease has been growing by epidemic proportions, with the prevalence increasing by approximately 50 percent per decade. Obesity's impact on individual overall health has drastically increased as well. It increases both morbidity and mortality rates and the risk of conditions such as diabetes, coronary heart disease (CHD) and cancer. It has a substantial negative effect on longevity, reducing the length of life of people who are severely obese by an estimated 5 to 20 years (Olshansky et al., 2005). Overweight and obesity are also contributing causes to more than 50 percent of all-cause mortality among American adults aged 20 to 74, which results in a significant economic impact&mdash;approximately $99.2 billion is spent annually on obesity-related medical care and disability in the U.S. (Thomas et al., 2003).</p><p>It is estimated that the aggregate cost of obesity ranges from 5 to 7 percent of the total of annual medical expenditures in the U.S. ($75 billion per year) (Finkelstein, Fiebelkorn, &amp; Wang, 2003; Finkelstein, Ruhm, &amp; Kosa, 2005). In 1994 the estimated cost of obesity to U.S. business was $12.7 billion ($10.1 billion due to moderate or severe obesity; $2.6 billion due to mild obesity). Obesity-attributable business expenditures include paid sick leave, life insurance and health insurance, totaling $2.4 billion, $1.8 billion and $800 million, respectively (Thompson et al., 1998). Not only is the prevalence of obesity increasing, but the relative per capita spending among obese Americans is also increasing. That increase accounted for 27 percent of the growth in real per capita spending between 1987 and 2001. Within that period, the prevalence of obesity increased by 10.3 percentage points, to almost 24 percent of the adult population (Thorpe et al., 2004). The rise in obesity is directly correlated to drastic increases in three major conditions: diabetes, hyperlipidemia and heart disease. The increase in per capita spending is caused by the increase in obesity prevalence and the increase in spending on the obese, relative to those of normal weight (Thompson et al., 1998).</p><p>Guidelines from various organizations, including the Institute for Clinical Systems Improvement (ICSI); the U.S. Preventive Services Task Force (USPSTF); the National Heart, Lung, and Blood Institute (NHLBI); and the Michigan Quality Improvement Consortium, indicate that the first step in weight management is assessment of height and weight in order to calculate a patient's body mass index (BMI).</p><p>BMI is considered the most efficient and effective method for assessing excess body fat; it is a starting point for assessing the relationship between weight and height, and it is the most conducive method of assessment in the primary care setting (NHLBI, 2001).</p></div>`
}, {
  code: 'WACNPACA',
  name: 'Weight Assessment and Counseling for Nutrition and Physical Activity for Children Adolescents',
  description: `<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49689/weight-assessment-and-counseling-for-nutrition-and-physical-activity-for-childrenadolescents-percentage-of-members-3-to-17-years-of-age-who-had-an-outpatient-visit-with-a-pcp-or-obgyn-and-who-had-evidence-of-bmi-percentile-documentation-during-the-measurement-#">Description</a></h3><div class="content_para"><p>This measure is used to assess the percentage of members 3 to 17 years of age who had an outpatient visit with a primary care practitioner (PCP) or obstetrician/gynecologist (OB/GYN) and who had evidence of body mass index (BMI) percentile documentation during the measurement year. Because BMI norms for youth vary with age and gender, this measure evaluates whether BMI percentile is assessed rather than an absolute BMI value.</p></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49689/weight-assessment-and-counseling-for-nutrition-and-physical-activity-for-childrenadolescents-percentage-of-members-3-to-17-years-of-age-who-had-an-outpatient-visit-with-a-pcp-or-obgyn-and-who-had-evidence-of-bmi-percentile-documentation-during-the-measurement-#">Rationale</a></h3><div class="content_para"><p>One of the most important developments in pediatrics in the past two decades has been the emergence of a new chronic disease: obesity in childhood and adolescence. The rapidly increasing prevalence of obesity among children is one of the most challenging dilemmas currently facing pediatricians. In addition to the growing prevalence of obesity in children and adolescents, overweight children at risk of becoming obese are also of great concern. The Centers for Disease Control and Prevention (CDC) states that overweight children and adolescents are more likely to become obese as adults. For example, one study found that approximately 80 percent of children who were overweight at 10 to 15 years of age were obese adults at age 25 (Whitaker et al., 1997). Another study found that 25 percent of obese adults were overweight as children; it also found that if overweight begins before 8 years of age, obesity in adulthood is likely to be more severe (Freedman et al., 2001).</p><p>Body mass index (BMI) is a useful screening tool for assessing and tracking the degree of obesity among adolescents. Screening for overweight or obesity begins in the provider's office with the calculation of BMI. Providers can estimate a child's BMI percentile for age and gender by plotting the calculated value of BMI with growth curves published and distributed by the CDC (Dorsey et al., 2005). Medical evaluations should include investigation into possible endogenous causes of obesity that may be amenable to treatment, and identification of any obesity-related health complications (Inge et al., 2004).</p><p>Because BMI norms for youth vary with age and gender, BMI percentiles rather than absolute BMI must be determined. The cut-off values to define the heaviest children are the 85th and 95th percentiles. In adolescence, as maturity is approached, the 85th percentile roughly approximates a BMI of 25, which is the cut-off for overweight in adults. The 95th percentile roughly approximates a BMI of 30 in the adolescent near maturity, which is the cut-off for obesity in adults. The cut-off recommended by an expert committee to define overweight (BMI greater than or equal to 95th percentile) is a conservative choice designed to minimize the risk of misclassifying non-obese children (Baker et al., 2005).</p><p>About two-thirds of young people in grades 9 to 12 do not engage in recommended levels of physical activity. Daily participation in high school physical education classes dropped from 42 percent in 1991 to 33 percent in 2005 (CDC, 2007). In the past 30 years, the prevalence of overweight and obesity has increased sharply for children. Among young people, the prevalence of overweight increased from 5.0 percent to 13.9 percent for those aged 2 to 5 years; from 6.5 percent to 18.8 percent for those aged 6 to 11 years; and from 5.0 percent to 17.4 percent for those aged 12 to 19 years. In 2000, the estimated total cost of obesity in the United States (U.S.) was about $117 billion. Promoting regular physical activity and healthy eating, as well as creating an environment that supports these behaviors, is essential to addressing the problem (CDC, 2007).</p></div>`
}, {
  code: 'CIS',
  name: 'Childhood Immunization Status',
  description: '<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49692/Childhood-immunization-status-percentage-of-children-2-years-of-age-who-had-four-diphtheria-tetanus-and-acellular-pertussis-DTaP-three-polio-IPV-one-measles-mumps-and-rubella-MMR-three-haemophilus-influenza-type-B-HiB-three-hepatitis-B-HepB-one-chicken-pox-VZV#">Description</a></h3><div class="content_para"><p>This measure is used to assess the percentage of children who turn two years of age during the measurement year who had four diphtheria, tetanus, and acellular pertussis (DTaP); three polio (IPV); one measles, mumps, and rubella (MMR); three haemophilus influenza type B (HiB); three hepatitis B (HepB); one chicken pox (VZV); four pneumococcal conjugate (PCV); one hepatitis A (HepA); two or three rotavirus (RV); and two influenza (flu) vaccines by their second birthday.</p><p>The Childhood Immunization Status (CIS) measure calculates a rate for each vaccine and nine separate combination rates. This measure summary represents the overall rate (combination #10).</p></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49692/Childhood-immunization-status-percentage-of-children-2-years-of-age-who-had-four-diphtheria-tetanus-and-acellular-pertussis-DTaP-three-polio-IPV-one-measles-mumps-and-rubella-MMR-three-haemophilus-influenza-type-B-HiB-three-hepatitis-B-HepB-one-chicken-pox-VZV#">Rationale</a></h3><div class="content_para"><p>A basic method for prevention of illness is immunization. Childhood immunizations help prevent serious illnesses such as polio, tetanus and hepatitis. Vaccines are a proven way to help a child stay healthy and avoid the potentially harmful effects of childhood diseases like mumps and measles. Even preventing "mild" diseases saves hundreds of lost school days and work days, and millions of dollars.</p><p>This measure follows the Centers for Disease Control and Prevention (CDC) Advisory Committee on Immunization Practices (ACIP) guidelines for immunizations (Kroger et al., 2006).</p></div>'
}, {
  code: 'BCS',
  name: 'Breast Cancer Screening',
  description: '<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/48809/breast-cancer-screening-percentage-of-women-50-to-74-years-of-age-who-had-a-mammogram-to-screen-for-breast-cancer#">Description</a></h3><div class="content_para"><p>This measure is used to assess the percentage of women 50 to 74 years of age who had a mammogram to screen for breast cancer.</p></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/48809/breast-cancer-screening-percentage-of-women-50-to-74-years-of-age-who-had-a-mammogram-to-screen-for-breast-cancer#">Rationale</a></h3><div class="content_para"><p>Breast cancer is the second most common type of cancer among American women, with approximately 178,000 new cases reported each year (American Cancer Society [ACS], 2007). It is most common in women over 50. Women whose breast cancer is detected early have more treatment choices and better chances for survival. Mammography screening has been shown to reduce mortality by 20 to 30 percent among women 40 and older. A mammogram can reveal tumors too small to be felt by hand; it can also show other changes in the breast that may suggest cancer</p><p>The U.S. Preventive Services Task Force (USPSTF), the American Academy of Family Physicians (AAFP), and the American College of Preventive Medicine recommend mammograms as the most effective method for detecting breast cancer when it is most treatable (USPSTF, 2002; "AAFP periodic," 2005; Ferrini et al., 1996). When high-quality equipment is used and well-trained radiologists read the x-rays, 85 to 90 percent of cancers are detectable.</p></div>'
}, {
  code: 'CDC',
  name: 'Comprehensive Diabetes Care',
  description: '<h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49716#">Description</a></h3><div class="content_para"><p>This measure is used to assess the percentage of members 18 to 75 years of age with diabetes (type 1 and type 2) who had a hemoglobin A1c (HbA1c) test performed during the measurement year.</p><p>The denominator for all rates must be the same, with the exception of <em>HbA1c control (less than 7.0%) for a selected population</em>.</p></div><h3><a href="https://www.qualitymeasures.ahrq.gov/summaries/summary/49716#">Rationale</a></h3><div class="content_para"><p>Diabetes is one of the most costly and highly prevalent chronic diseases in the United States (U.S.). Approximately 26.5 million Americans have diabetes, and seven million of these cases are undiagnosed. Complications from the disease cost the country nearly $245 billion annually. In addition, diabetes is the seventh leading cause of death in the U.S. (American Diabetes Association, 2013). Many complications, such as amputation, blindness, and kidney failure, can be prevented if detected and addressed in the early stages.</p></div>'
}];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculate(code, total) {
  const targets = {
    W15: [57, 69],
    CIS: [70, 75],
    BCS: [75, 80],
  }
  const p = targets[code] || [85, 100];
  const completed = Math.trunc(total * random(p[0], p[1]) / 100);
  return { total, completed };
}

function generateData(code) {
  const data = [];
  for (let year = 2010; year <= new Date().getFullYear(); year++) {
    for (let month = 1; month <= 12; month++) {
      const val = calculate(code, random(500, 1500));
      const item = {
        code: code,
        year,
        month: month,
        total: val.total,
        completed: val.completed
      };
      data.push(item);
    }
  }
  return data;
}

const mockData = {};
measures.forEach(m => {
  mockData[m.code] = {
    code: m.code,
    info: m,
    data: generateData(m.code)
  }
});

export default {
  measures() {
    // [{code, name, description}]
    return measures;
  },
  yearlyData(code, minYear, maxYear) {
    return null;
  },
  monthlyData(code, minYear = -1, maxYear) {
    const result = {};
    for (const cd of Object.keys(mockData)) {
      if (!code || (code === cd)) {
        result[cd] = (mockData[cd].data || []).filter(v => v.year >= minYear);
      }
    }
    return result;
  }
}

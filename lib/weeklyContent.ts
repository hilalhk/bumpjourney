export type WeekContent = {
  baby: string;
  babyDetail: string;
  movement: string;
  movementDetail: string;
  body: string;
  bodyDetail: string;
};

export const weeklyContent: Record<number, WeekContent> = {
  4: {
    baby: 'Implantation complete', babyDetail: 'The embryo has implanted in the uterine lining. The amniotic sac and placenta are beginning to form. The neural tube, which becomes the brain and spinal cord, starts developing this week.',
    movement: 'Too early to feel', movementDetail: 'The embryo is far too small for any movement to be felt. That milestone is typically months away — usually between weeks 16 and 25.',
    body: 'Missed period', bodyDetail: 'This is often the week a period is missed and a test turns positive. Hormone levels are rising rapidly, and some people notice mild cramping or spotting from implantation.',
  },
  5: {
    baby: 'Heart begins forming', babyDetail: 'The heart is forming and may begin to beat by the end of this week. The embryo is developing three distinct layers that will become all of the body\'s organs and tissues.',
    movement: 'Too early to feel', movementDetail: 'No movement yet — the embryo is the size of a sesame seed. The first flutters are typically felt between weeks 16 and 25.',
    body: 'Early symptoms may start', bodyDetail: 'Fatigue, breast tenderness, and nausea may begin. Rising hCG and progesterone are responsible. Many people feel nothing yet — both are normal.',
  },
  6: {
    baby: 'Heartbeat detectable', babyDetail: 'The heart is now beating — often visible on an early ultrasound. Facial features are starting to form, including the beginnings of eyes and nostrils. Small buds that become arms and legs appear.',
    movement: 'Too early to feel', movementDetail: 'The embryo moves spontaneously now, but it\'s far too small to feel. First noticeable movements typically come between weeks 16 and 25.',
    body: 'Morning sickness may begin', bodyDetail: 'Nausea (not just in the morning) affects up to 80% of pregnancies and often starts around now. Eating small, frequent meals can help. Contact a doctor if you can\'t keep fluids down.',
  },
  7: {
    baby: 'Brain growing rapidly', babyDetail: 'The brain is generating about 100 new cells every minute. Arm and leg buds are lengthening, and the umbilical cord is now fully formed, delivering oxygen and nutrients.',
    movement: 'Too early to feel', movementDetail: 'Tiny spontaneous movements are happening, but nothing that can be felt yet.',
    body: 'Frequent urination', bodyDetail: 'Increased blood flow to the kidneys and a growing uterus pressing on the bladder mean more bathroom trips. Stay hydrated anyway — cutting fluids doesn\'t help and isn\'t safe.',
  },
  8: {
    baby: 'Fingers and toes forming', babyDetail: 'Webbed fingers and toes are forming, and the tail the embryo had is almost gone. Taste buds are beginning to develop, and the lungs\' airway tubes are branching.',
    movement: 'Spontaneous movements', movementDetail: 'The embryo makes small spontaneous movements, visible on ultrasound but far too faint to feel.',
    body: 'Possible food aversions', bodyDetail: 'Strong aversions to foods or smells you previously enjoyed are common and usually peak in the first trimester. Eat what you can keep down; balance can come later.',
  },
  9: {
    baby: 'Now officially a fetus', babyDetail: 'The embryonic period ends — your baby is now medically termed a fetus. All essential organs have begun to form. Tiny muscles are developing, allowing small movements.',
    movement: 'Small twitches', movementDetail: 'Muscle development means small twitching movements, visible on ultrasound. Still much too early to feel anything.',
    body: 'Mood swings', bodyDetail: 'Hormone shifts can cause noticeable mood swings, alongside continued fatigue and nausea. Be kind to yourself — this is a physically demanding phase even when nothing shows.',
  },
  10: {
    baby: 'Vital organs functioning', babyDetail: 'All vital organs are formed and starting to function. Bones and cartilage are forming, fingernails are developing, and the baby can bend its elbows.',
    movement: 'Active but unfelt', movementDetail: 'The baby is increasingly active — stretching, turning, even hiccuping. It will still be weeks before you can feel any of it.',
    body: 'Visible veins', bodyDetail: 'Blood volume is increasing significantly — you may notice more visible veins on your chest and abdomen. Some people start to show a small bump around now; many don\'t until later.',
  },
  11: {
    baby: 'Head is half the body', babyDetail: 'The head makes up about half of the body length right now. Tooth buds, hair follicles, and nail beds are forming. The baby can open and close its fists.',
    movement: 'Stretches and rolls', movementDetail: 'The baby stretches, rolls, and somersaults in the amniotic fluid. There\'s plenty of room in there — these acrobatics will be feelable in a couple of months.',
    body: 'Nausea may begin easing', bodyDetail: 'For many, nausea starts to ease as the first trimester winds down. Energy may slowly return. If symptoms suddenly vanish much earlier, mention it at your next appointment — usually it\'s nothing.',
  },
  12: {
    baby: 'Reflexes developing', babyDetail: 'Reflexes are developing — the baby may curl its fingers and toes and clench its eye muscles. The intestines, which grew partly into the umbilical cord, are moving into the abdomen.',
    movement: 'Reflexive movements', movementDetail: 'If you press on your abdomen, the baby will likely squirm in response — though you won\'t feel it yet. Movements are becoming less jerky and more fluid.',
    body: 'End of first trimester near', bodyDetail: 'The uterus is growing up and out of the pelvis. Many people have their first major scan around now — often the moment pregnancy starts to feel real.',
  },
  13: {
    baby: 'Vocal cords forming', babyDetail: 'Vocal cords are forming this week. The baby\'s body is starting to catch up with its head, and unique fingerprints have formed on its fingertips.',
    movement: 'Increasingly coordinated', movementDetail: 'Movements are becoming smoother and more coordinated as the nervous system matures. Still below the threshold of feeling.',
    body: 'Welcome to the second trimester', bodyDetail: 'The second trimester — often called the golden period — begins. Energy typically improves, nausea fades, and miscarriage risk drops significantly after this point.',
  },
  14: {
    baby: 'Facial expressions', babyDetail: 'The baby can now squint, frown, and grimace thanks to developing facial muscles. The kidneys are producing urine, and hair is beginning to sprout on the head.',
    movement: 'Practicing constantly', movementDetail: 'The baby is in near-constant motion when awake — but cushioned by amniotic fluid and a still-small size, none of it reaches you yet.',
    body: 'Energy returning', bodyDetail: 'Many people feel a real lift in energy and appetite around now. This is a good window to establish gentle exercise habits — walking and prenatal yoga are great defaults.',
  },
  15: {
    baby: 'Sensing light', babyDetail: 'Though the eyelids remain fused shut, the baby can sense light — shine a torch at your belly and it may move away from the beam. The skeleton is hardening from cartilage to bone.',
    movement: 'First flutters possible soon', movementDetail: 'Some people — especially in second or later pregnancies — begin feeling faint flutters ("quickening") in the coming weeks. First-timers usually feel it later, around 18–25 weeks.',
    body: 'Round ligament pain', bodyDetail: 'Sharp twinges in the lower belly or groin when you move suddenly are usually round ligament pain — the ligaments supporting the uterus stretching. Common and harmless, but mention persistent pain to your doctor.',
  },
  16: {
    baby: 'Growth spurt underway', babyDetail: 'A growth spurt is underway — the baby will double its weight in the next few weeks. The eyes have moved to the front of the face, and the ears are close to their final position.',
    movement: 'Quickening window opens', movementDetail: 'Between now and week 25, most people feel the first movements — like bubbles, flutters, or popcorn. If this is your first pregnancy, it may still take a few more weeks.',
    body: 'The bump emerges', bodyDetail: 'Many people are visibly showing now. The top of the uterus is about halfway between your pubic bone and navel. Time for looser waistbands — or full maternity wear, whatever feels right.',
  },
  17: {
    baby: 'Fat stores beginning', babyDetail: 'The baby is starting to form fat stores — important for warmth and energy after birth. The umbilical cord is growing stronger and thicker, and the baby can move its joints.',
    movement: 'Flutters for some', movementDetail: 'Subtle flutters may be perceptible, especially when lying still. Many describe it as gas bubbles or a goldfish swimming. No movement felt yet is also completely normal.',
    body: 'Possible appetite surge', bodyDetail: 'With nausea fading, appetite often increases noticeably. Aim for nutrient-dense foods, and remember "eating for two" really means about 300 extra calories a day in the second trimester.',
  },
  18: {
    baby: 'Hearing develops', babyDetail: 'The ears are now functional — the baby is beginning to hear your heartbeat, digestion, and muffled voices. Myelin, a protective coating, is forming around the nerves.',
    movement: 'Movements strengthening', movementDetail: 'If you\'ve felt flutters, they\'ll grow more distinct now. The baby has wake and sleep cycles, so movement comes in bursts.',
    body: 'Possible dizziness', bodyDetail: 'Your cardiovascular system is working hard, and blood pressure may run lower than usual, causing dizziness when standing quickly. Rise slowly, stay hydrated, and snack regularly.',
  },
  19: {
    baby: 'Protective coating forms', babyDetail: 'Vernix caseosa — a waxy, protective coating — is covering the baby\'s skin to protect it from the amniotic fluid. Sensory areas of the brain for taste, smell, hearing, vision and touch are developing fast.',
    movement: 'More distinct kicks', movementDetail: 'Movements are graduating from flutters to gentle taps and kicks. You may start noticing patterns — many babies are most active when you lie down in the evening.',
    body: 'Leg cramps', bodyDetail: 'Nighttime leg cramps are common from the second trimester on. Stretching calves before bed, staying hydrated, and gentle exercise can help reduce them.',
  },
  20: {
    baby: 'Halfway milestone', babyDetail: 'Halfway there! The baby is swallowing more, good practice for the digestive system. The anatomy scan around this week checks all major organs and structures in detail.',
    movement: 'Kicks becoming regular', movementDetail: 'Most first-time parents have felt movement by now or will very soon. Kicks are becoming stronger and more regular, though still not on a predictable schedule.',
    body: 'The anatomy scan', bodyDetail: 'The 20-week anatomy scan is the big appointment of the second trimester — a detailed look at the baby\'s development. It\'s also typically when you can learn the sex, if you want to.',
  },
  21: {
    baby: 'Taste buds working', babyDetail: 'The baby\'s taste buds are functional and connected — flavors from your diet pass into the amniotic fluid, giving the baby its first taste experiences. Bone marrow is starting to make blood cells.',
    movement: 'Kicks more regular', movementDetail: 'You\'re likely feeling regular movement now, and others may feel kicks by placing a hand on your belly. The baby still has room to somersault — expect acrobatics.',
    body: 'Round ligament pain', bodyDetail: 'As the uterus grows faster, round ligament twinges may return. Your center of gravity is shifting too — posture support and comfortable shoes earn their keep from here on.',
  },
  22: {
    baby: 'Looking like a newborn', babyDetail: 'The baby now looks like a miniature newborn — lips, eyelids, and eyebrows are distinct. The eyes have formed, though the iris lacks pigment. Grip strength is developing as the baby grabs the umbilical cord.',
    movement: 'Visible from outside', movementDetail: 'Stronger kicks may now be visible from the outside — watch your belly during active periods. Partners can usually feel movement reliably now.',
    body: 'Possible swelling', bodyDetail: 'Mild swelling in the feet and ankles is common, especially after standing. Elevate your feet when you can. Sudden or severe swelling, especially with headaches, warrants a call to your doctor.',
  },
  23: {
    baby: 'Hearing your voice', babyDetail: 'The baby hears your voice clearly now and may respond to loud sounds with movement. The lungs are developing surfactant, a substance essential for breathing air after birth.',
    movement: 'Responding to sound', movementDetail: 'You may notice the baby jump at sudden loud noises, or settle when you talk or play music. This sound-movement link is a sign of healthy development.',
    body: 'Braxton Hicks may start', bodyDetail: 'You may begin noticing Braxton Hicks — irregular, painless tightening of the uterus. They\'re practice contractions, normal from now on. If they become regular or painful, contact your provider.',
  },
  24: {
    baby: 'Viability milestone', babyDetail: 'Week 24 is a major medical milestone — babies born from this point have a chance of survival with intensive care, improving every week. The lungs are developing air sacs, and the skin is becoming less translucent.',
    movement: 'Strong, frequent kicks', movementDetail: 'Movement is strong and frequent. You may begin recognizing body parts — a foot dragging across, an elbow jab. Enjoy the show.',
    body: 'Glucose screening ahead', bodyDetail: 'The glucose screening test for gestational diabetes typically happens between weeks 24 and 28. It\'s routine — and catching it matters, since gestational diabetes is very manageable once known.',
  },
  25: {
    baby: 'Hair color visible', babyDetail: 'The baby\'s hair has color and texture now. The nostrils, previously plugged, are opening, and the baby is practicing breathing motions with amniotic fluid.',
    movement: 'Patterns emerging', movementDetail: 'You likely know your baby\'s active times by now — commonly after meals and at night. Getting familiar with the normal pattern matters: it\'s the baseline for kick counting later.',
    body: 'Possible heartburn', bodyDetail: 'The growing uterus pressing on the stomach plus relaxed digestive muscles often means heartburn. Smaller meals, staying upright after eating, and avoiding trigger foods help.',
  },
  26: {
    baby: 'Eyes opening soon', babyDetail: 'The eyes, fused shut since the first trimester, are about to open. The baby\'s brain-wave activity for hearing and sight is now detectable. Lungs continue maturing rapidly.',
    movement: 'Responding to light', movementDetail: 'With eyes nearly functional, the baby may respond to bright light against your belly. Movements are strong enough to occasionally take your breath away.',
    body: 'Lower back ache', bodyDetail: 'The shifting center of gravity and loosening ligaments commonly cause lower back ache from here on. Prenatal yoga, swimming, and a maternity support belt can all genuinely help.',
  },
  27: {
    baby: 'Brain growing fast', babyDetail: 'The brain is in a major growth phase, developing the grooves and folds of a mature brain. The baby may recognize your voice and your partner\'s. Sleep now includes REM cycles — the baby may be dreaming.',
    movement: 'Hiccups!', movementDetail: 'Rhythmic little jumps in your belly are baby hiccups — common from now on as the baby practices breathing. They\'re harmless and, for most people, quite charming.',
    body: 'Last week of trimester 2', bodyDetail: 'The second trimester ends this week. If you haven\'t started thinking about a birth plan and antenatal classes, the third trimester is the time.',
  },
  28: {
    baby: 'Eyes open', babyDetail: 'The eyes are open during waking hours, with eyelashes formed. The baby can blink and now has sleep-wake cycles you may recognize. Survival rates from this week are very high with good care.',
    movement: 'Kick counting begins', movementDetail: 'From week 28, many providers recommend daily kick counting — tracking how long it takes to feel 10 movements. A noticeable decrease in movement is always worth a call to your provider, day or night.',
    body: 'Third trimester begins', bodyDetail: 'Welcome to the final stretch. Appointments typically increase to every two weeks. Fatigue may return — your body is working harder than ever.',
  },
  29: {
    baby: 'Bones hardening', babyDetail: 'Bones are fully developed but still soft and pliable, hardening as the baby stores calcium. The baby\'s muscles and lungs continue maturing, and the head is growing for the developing brain.',
    movement: 'Stronger but smoother', movementDetail: 'As space tightens, dramatic somersaults give way to strong stretches, rolls, and jabs. The intensity should not decrease — keep tracking the daily pattern.',
    body: 'Shortness of breath', bodyDetail: 'The uterus is pressing the diaphragm, so breathlessness on stairs is normal. Good posture helps. Sudden severe breathlessness with chest pain is an emergency — call for help.',
  },
  30: {
    baby: 'Brain taking control', babyDetail: 'The brain is developed enough to begin regulating body temperature. The bone marrow has fully taken over red blood cell production. The baby\'s grip is now strong.',
    movement: 'Regular daily rhythm', movementDetail: 'Movements follow a fairly consistent daily rhythm now. Many babies have a party right when you lie down to sleep — the swaying that lulls them while you\'re upright stops.',
    body: 'Sleep gets harder', bodyDetail: 'Finding a comfortable sleeping position is increasingly hard. Side sleeping with a pillow between the knees is recommended — left side is often suggested for optimal blood flow.',
  },
  31: {
    baby: 'All five senses working', babyDetail: 'All five senses are functional. The baby is processing information, tracking light, and perceiving signals from all senses. Major weight gain is ahead — the baby will roughly double from here.',
    movement: 'Less room, same strength', movementDetail: 'Quarters are getting cramped, so expect more pushes, stretches and rolls than kicks. Strength and frequency should stay consistent — that\'s what matters.',
    body: 'Colostrum may appear', bodyDetail: 'Your breasts may begin leaking colostrum — the nutrient-rich first milk. Completely normal (so is its absence). Breast pads help if leaking is noticeable.',
  },
  32: {
    baby: 'Practicing for birth', babyDetail: 'The baby is practicing breathing, swallowing, and sucking — the survival skills needed at birth. Fingernails have reached the fingertips. Many babies settle head-down around now.',
    movement: 'Position matters now', movementDetail: 'You may feel where the baby\'s head, back, and feet are. If the baby is breech (head up), there\'s still time to turn — most do by week 36.',
    body: 'Frequent urination returns', bodyDetail: 'As the baby descends and grows, bladder pressure increases again. Leaking a little when sneezing or laughing is common — pelvic floor exercises help now and after birth.',
  },
  33: {
    baby: 'Immune system loading', babyDetail: 'Antibodies are passing from you to the baby, building immunity for the first months of life. The bones are hardening — except the skull, which stays flexible for birth.',
    movement: 'Strong and snug', movementDetail: 'Movements may feel different — more pressure and rolling, less jabbing — but should be just as frequent. Any significant slowdown means call your provider.',
    body: 'Possible "lightning crotch"', bodyDetail: 'Sharp, brief zings of pelvic or groin pain — colorfully called lightning crotch — happen as the baby presses on nerves. Startling but harmless. Persistent pain is the thing to report.',
  },
  34: {
    baby: 'Lungs nearly mature', babyDetail: 'The lungs are nearly fully developed. The vernix coating is thickening. Babies born from now generally do very well, often needing only a short nursery stay.',
    movement: 'Watching the pattern', movementDetail: 'The daily movement pattern is your most important monitoring tool from here. Keep doing the kick counts — the routine pays off precisely when something feels different.',
    body: 'Pelvic pressure builds', bodyDetail: 'You may feel increasing pressure in the pelvis as the baby moves lower. Walking may take on a waddle — your gait is compensating for shifted weight and loosened joints.',
  },
  35: {
    baby: 'Rapid weight gain', babyDetail: 'The baby is gaining around 200 grams a week now, mostly fat that smooths the skin and helps regulate temperature after birth. The kidneys and liver are fully functional.',
    movement: 'Rolls over kicks', movementDetail: 'Big rolls and stretches dominate as space disappears. The head may engage in your pelvis soon — you might literally feel the moment things "drop".',
    body: 'Weekly appointments soon', bodyDetail: 'From week 36, appointments typically become weekly. The Group B Strep test usually happens between 36 and 37 weeks — a routine swab with important implications for labor care.',
  },
  36: {
    baby: 'Considered "early term" soon', babyDetail: 'One more week until the baby is considered early term. The baby is likely head-down and may be descending into the pelvis. The digestive system is ready for milk.',
    movement: 'Engagement may happen', movementDetail: 'If the baby "drops" (engages in the pelvis), you may breathe easier but feel more pelvic pressure. Movement continues right up to birth — the myth that babies go quiet before labor is false and dangerous.',
    body: 'Hospital bag time', bodyDetail: 'Pack the hospital bag now if you haven\'t. From 37 weeks, labor could realistically begin any day. Install the car seat too — hospitals check before discharge in many places.',
  },
  37: {
    baby: 'Early term!', babyDetail: 'The baby is now early term — development is essentially complete, and the final weeks add fat and lung maturity. The baby is practicing breathing, sucking and swallowing constantly.',
    movement: 'Consistent until birth', movementDetail: 'Movement should remain consistent in frequency and strength right up to and during labor. Reduced movement at any point from here means contact your provider immediately.',
    body: 'Signs of approaching labor', bodyDetail: 'Watch for early labor signs: the mucus plug passing, "bloody show", regular tightening, low backache, or waters breaking. When contractions are regular and strengthening, it\'s time.',
  },
  38: {
    baby: 'Adding final touches', babyDetail: 'The brain and nervous system are fine-tuning. The baby has a firm grip, fully formed nails, and may have a head of hair. Most of the vernix and lanugo have shed.',
    movement: 'Squirms and stretches', movementDetail: 'Movement is mostly squirms, stretches, and pressure now. Keep monitoring the daily pattern — same rule as always: any decrease, call.',
    body: 'Nesting and waiting', bodyDetail: 'The nesting urge — a burst of energy to prepare — is common. Honor it but don\'t exhaust yourself. Rest is the most strategic thing you can store up right now.',
  },
  39: {
    baby: 'Full term', babyDetail: 'Officially full term. The baby is simply gaining weight and waiting. The placenta continues supplying antibodies that protect the baby after birth.',
    movement: 'Right up to delivery', movementDetail: 'Expect movement during early labor too. Your kick-counting habit remains valuable until the very end.',
    body: 'Any day now', bodyDetail: 'Only about 5% of babies arrive on their due date — anywhere in the next two weeks (and a bit beyond) is normal. Keep appointments; your provider monitors you and the baby closely from here.',
  },
  40: {
    baby: 'Due date week', babyDetail: 'The official finish line — though many first babies arrive after the due date. The baby is fully developed and, on average, around 3.5 kg and 51 cm.',
    movement: 'Still kicking', movementDetail: 'Even now, regular movement is the rule. Many providers do extra monitoring past the due date to keep an eye on the baby\'s wellbeing.',
    body: 'The final stretch', bodyDetail: 'If labor doesn\'t start naturally, your provider will discuss monitoring and possibly induction, usually offered between 41 and 42 weeks. You\'re at the very end — well done.',
  },
};

export function getWeekContent(week: number): WeekContent {
  const clamped = Math.min(40, Math.max(4, week));
  return weeklyContent[clamped];
}
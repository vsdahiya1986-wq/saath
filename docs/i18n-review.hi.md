# Hindi translation review

Generated 2026-09-20T09:23:42.917Z by `node scripts/verify-translations.mjs --run`. Do not edit by hand.

- Engine A: Bhashini translation en→hi. Engine B: Bhashini translation hi→en. IndicTrans2 is the intended engine B but its models are gated; see the script header.
- FAIL = a denylisted concept, or the round trip diverges on **both** meaning (similarity < 0.75) and words (overlap < 0.5).
- A FAIL shows its English on screen and has no Hindi audio. LONG = more than 1.8× the English length (may clip).

**286/295 verified (97%). 9 fall back to English.**

## Needs human review (9)

| key | English | Hindi | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `remind.done` | Done | हो गया | has become | 0.18 | 0 | FAIL |
| `q.today_me.season` | Which season is it now? | अब कौन सा मौसम है? | What's the weather now? | 0.39 | 0.33 | FAIL |
| `done.season` | Season | मौसम | weather | 0.39 | 0 | FAIL |
| `step.reg_prayer_routine.put_out` | Put out the lamp | बत्ती बुझा दो | turn the lights off | 0.55 | 0 | FAIL |
| `together.places.q` | Where is a place that made you feel happy? | ऐसी कौन सी जगह है जहाँ आपको खुशी मिलती हो? | Where do you find happiness? | 0.7 | 0.2 | FAIL |
| `together.friends.theme` | Friends | दोस्त | friend | 0.69 | 0 | FAIL |
| `why.apon_mukh.similar_to` | Tasks that join a face to a name | ऐसे कार्य जो किसी नाम के चेहरे को जोड़ते हैं | Functions that connect the faces of a name | 0.65 | 0.25 | FAIL |
| `mood.ok` | All right | ठीक है | Okay | 0.48 | 0 | FAIL |
| `trend.unaided` | activities finished with no help this week | इस सप्ताह बिना किसी सहायता के समाप्त गतिविधियाँ | Unassisted activities this week | 0.7 | 0.33 | FAIL |

### Flagged by reading (0)

Flagged by a person reading the screen, not by a native speaker — kept here for review even when the round trip passes.

None.

## Passed but long — check for clipping (7)

| key | English | Hindi | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `home.help` | Help | मदद करें | Help | 1 | 1 | PASS · LONG |
| `help.title` | Help | मदद करें | Help | 1 | 1 | PASS · LONG |
| `exit.end` | Finish | समाप्त करें | Finish | 1 | 1 | PASS · LONG |
| `opt.season.summer` | Summer | ग्रीष्म ऋतु | Summer season | 0.91 | 1 | PASS · LONG |
| `opt.season.winter` | Winter | सर्दी का मौसम | Winter season | 0.9 | 1 | PASS · LONG |
| `reminder.none` | No reminders set yet | अभी तक कोई अनुस्मारक सेट नहीं किया गया है | No reminder has been set yet | 0.92 | 0.75 | PASS · LONG |
| `mood.good` | Good | अच्छा है | it's good | 0.67 | 1 | PASS · LONG |

## Every key

| key | English | Hindi | round-trip English | similarity | word overlap | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `home_intro` | This is your memory companion. Choose Play, Help, or Today. | यह आपकी स्मृति साथी है। प्ले, हेल्प या टुडे चुनें। | This is your memory companion. Choose Play, Help, or Today. | 1 | 1 | PASS |
| `home.play` | Play | बजाएँ | Play | 1 | 1 | PASS |
| `home.help` | Help | मदद करें | Help | 1 | 1 | PASS · LONG |
| `home.today` | Today | आज | today's | 0.81 | 1 | PASS |
| `home.circle` | Circle | वृत्त | circle | 1 | 1 | PASS |
| `home.help.ok` | No help is needed now | अब किसी मदद की जरूरत नहीं है | No need for help now | 0.84 | 0.75 | PASS |
| `activity.familiar_pairs` | Today & Me | आज और मैं | Today, me and my | 0.83 | 1 | PASS |
| `activity.sound_sight` | Hear & Find | सुनो और ढूँढो | Listen and find out | 0.64 | 0.5 | PASS |
| `activity.pattern_garden` | Sort the Home | घर को क्रमबद्ध करें | Sort the house | 0.94 | 0.5 | PASS |
| `activity.my_next_step` | My Next Step | मेरा अगला कदम | It's my next step | 0.86 | 1 | PASS |
| `activity.together` | Together Moment | एक साथ पल | A moment together | 0.85 | 1 | PASS |
| `activity.saah_pat` | Saah Pat · Tea Leaf | साह पट · चाय का पत्ता | Tea leaf tea | 0.57 | 0.5 | PASS |
| `activity.apon_mukh` | Apon Mukh · Dear Faces | अपोन मुख · प्रिय चेहरे | Apon Mukha · Dear Face | 0.93 | 0.5 | PASS |
| `play.today_three` | Three for today | आज के लिए तीन | Three for today | 1 | 1 | PASS |
| `play.all_activities` | All activities | सभी गतिविधियाँ | All of the activities | 0.93 | 1 | PASS |
| `display.text_size` | Text size | पाठ का आकार | The size of the text | 0.86 | 1 | PASS |
| `rest.title` | Do you want to rest now? | क्या आप अब आराम करना चाहते हैं? | Do you want to rest now? | 1 | 1 | PASS |
| `rest.rest_now` | Rest now | अभी आराम करें | Relax now | 0.57 | 0.5 | PASS |
| `rest.one_more` | Play one more | एक और बजाएँ | play another one | 0.85 | 0.67 | PASS |
| `domain.memory` | Memory | स्मृति | Memory | 1 | 1 | PASS |
| `domain.attention` | Attention & Concentration | ध्यान और एकाग्रता | Attention and concentration | 0.98 | 1 | PASS |
| `domain.routine` | Daily Routine Recall | दैनिक रूटीन रिकॉल | Daily routine recall | 1 | 1 | PASS |
| `domain.pattern` | Pattern & Object Recognition | पैटर्न और वस्तु पहचान | Pattern and object recognition | 0.96 | 1 | PASS |
| `domain.emotion` | Emotional Engagement | भावनात्मक जुड़ाव | Emotional attachment | 0.67 | 0.5 | PASS |
| `status.offline` | No internet connection | इंटरनेट कनेक्शन नहीं है | There is no Internet connection | 0.91 | 1 | PASS |
| `status.synced` | Saved | सहेजा गया | Saved | 1 | 1 | PASS |
| `status.no_signal` | Test: no internet | परीक्षणः कोई इंटरनेट नहीं | Test: There is no Internet | 0.96 | 1 | PASS |
| `adaptive.same` | The same as last time | पिछली बार की तरह ही | Just like the last time | 0.76 | 0.5 | PASS |
| `adaptive.easier` | A little easier today | आज थोड़ा आसान है | Today is a little easier | 0.93 | 1 | PASS |
| `adaptive.harder` | A little harder today | आज थोड़ा मुश्किल है | Today is a little more difficult | 0.85 | 0.67 | PASS |
| `adaptive.with_help` | With some help today | आज कुछ मदद के साथ | With a little help today | 0.9 | 0.75 | PASS |
| `play.title` | Choose an activity | एक गतिविधि चुनें | Select an activity | 0.84 | 0.5 | PASS |
| `play.pairs.intro` | Let us talk about today. Choose the answer you think is correct. There is no hurry. | आइए आज के बारे में बात करते हैं। वह उत्तर चुनें जो आपको सही लगे। कोई जल्दबाजी नहीं है। | Let's talk about today. Choose the answer that you think is correct. There is no hurry. | 0.97 | 1 | PASS |
| `play.sound.intro` | Listen to the word, then tap the matching picture. | शब्द को सुनें, फिर मेल खाने वाली तस्वीर पर टैप करें। | Listen to the word, then tap the matching image. | 0.95 | 0.83 | PASS |
| `play.pattern.intro` | Tap the basket where this belongs. | उस टोकरी पर टैप करें जहाँ यह है। | Tap the basket where it is. | 0.92 | 0.75 | PASS |
| `play.step.intro` | Put the steps of your routine in order. | अपनी दिनचर्या के चरणों को क्रम में रखें। | Keep the steps of your routine in order. | 0.92 | 0.75 | PASS |
| `play.together.intro` | Let us look at this picture together. | आइए हम इस तस्वीर को एक साथ देखें। | Let us look at this picture together. | 1 | 1 | PASS |
| `play.saah_pat.intro` | Find the tea shoots with two leaves and one bud. Tap each one you see. There is no hurry. | दो पत्तियों और एक कली के साथ चाय के अंकुर ढूंढें। आप जो भी देख रहे हैं, उस पर टैप करें। कोई जल्दबाजी नहीं है। | Find tea shoots with two leaves and a bud. Tap on whatever you're looking at. There is no hurry. | 0.92 | 0.77 | PASS |
| `play.apon_mukh.intro` | Tap two cards to see the pictures. Find the two that match. | चित्र देखने के लिए दो कार्ड दबाएँ। उन दोनों को ढूंढें जो मेल खाते हैं। | Press two cards to see the picture. Find the two that match. | 0.88 | 0.71 | PASS |
| `game.not_this_one` | Not this one. | यह नहीं। | It's not. | 0.33 | 0.5 | PASS |
| `cue.highlight` | Look here. | यहां देखिए। | Look here. | 1 | 1 | PASS |
| `cue.reduce` | Let us try with fewer choices. | आइए हम कम विकल्पों के साथ प्रयास करें। | Let us try with fewer options. | 0.9 | 0.75 | PASS |
| `common.pause` | Paused. Tap to continue, or choose Stop. | रुक गया। जारी रखने के लिए दबाएँ, या रुकें चुनें। | stopped. Press to continue, or select Pause. | 0.82 | 0.2 | PASS |
| `common.open` | Open | खोलें | Open | 1 | 1 | PASS |
| `common.back` | Go back | वापस जाओ | Go back | 1 | 1 | PASS |
| `common.home` | Home | घर | Home | 1 | 1 | PASS |
| `common.continue` | Continue | जारी रखें | Continue | 1 | 1 | PASS |
| `a11y.listen` | Listen | सुनो | Listen | 1 | 1 | PASS |
| `help.title` | Help | मदद करें | Help | 1 | 1 | PASS · LONG |
| `help.need` | I need someone | मुझे किसी की ज़रूरत है | I need somebody | 0.95 | 0.67 | PASS |
| `help.sent_local` | Your family has been told. | आपके परिवार को बता दिया गया है। | Your family has been informed. | 0.9 | 0.75 | PASS |
| `help.stored` | Saved on this device. It will be sent when there is a connection. | इस उपकरण पर सहेजा गया। कनेक्शन होने पर इसे भेजा जाएगा। | saved on this device. It will be sent when the connection is made. | 0.98 | 1 | PASS |
| `help.stale_warning` | This photo may show an old place. | यह तस्वीर किसी पुरानी जगह को दिखा सकती है। | This picture may show an old place. | 0.98 | 0.8 | PASS |
| `today.title` | Today's reminders | आज के अनुस्मारक | Today's reminders | 1 | 1 | PASS |
| `remind.medicine` | It is time for your medicine. | यह आपकी दवा का समय है। | It's time for your medication. | 0.89 | 0.5 | PASS |
| `remind.hydration` | It is time for a glass of water. | यह एक गिलास पानी पीने का समय है। | It's time to drink a glass of water. | 0.87 | 1 | PASS |
| `remind.activity` | It is time for your daily activity. | यह आपकी दैनिक गतिविधियों का समय है। | This is the time for your daily activities. | 0.89 | 0.67 | PASS |
| `remind.appointment` | You have a clinic appointment. | आपके पास एक क्लिनिक नियुक्ति है। | You have a clinic appointment. | 1 | 1 | PASS |
| `remind.done` | Done | हो गया | has become | 0.18 | 0 | FAIL |
| `remind.not_now` | Not now | अभी नहीं | Not yet | 0.62 | 0.5 | PASS |
| `exit.pause` | Stop for a moment | एक पल के लिए रुकें | Pause for a moment | 0.77 | 0.5 | PASS |
| `exit.skip_one` | Skip this step | इस चरण को छोड़ दें | Skip this step | 1 | 1 | PASS |
| `exit.end` | Finish | समाप्त करें | Finish | 1 | 1 | PASS · LONG |
| `game.well_done` | Well done. That was good. | अच्छा किया है। यह तो अच्छा ही हुआ। | Well done That was good. | 0.89 | 1 | PASS |
| `game.gentle_end` | That is fine. We can try again another day. | यह तो ठीक है। हम एक और दिन फिर से कोशिश कर सकते हैं। | That's alright. We can try again another day. | 0.95 | 0.83 | PASS |
| `game.look_again` | Let us look again. | आइए हम फिर से देखें। | Let us look again. | 1 | 1 | PASS |
| `game.good` | Yes, that is right. | हां, यह सही है। | Yes, that's correct. | 0.83 | 0.5 | PASS |
| `q.today_me.part_of_day` | What part of the day is it now? | यह अब दिन का कौन सा हिस्सा है? | What part of the day is it now? | 1 | 1 | PASS |
| `q.today_me.season` | Which season is it now? | अब कौन सा मौसम है? | What's the weather now? | 0.39 | 0.33 | FAIL |
| `q.today_me.weekday` | What day of the week is it today? | आज सप्ताह का कौन सा दिन है? | What day of the week is today? | 0.97 | 1 | PASS |
| `q.today_me.month` | Which month is it now? | अब कौन सा महीना है? | What month is it now? | 0.97 | 0.67 | PASS |
| `opt.period.morning` | Morning | सुबह | In the morning | 0.76 | 1 | PASS |
| `opt.period.afternoon` | Afternoon | दोपहर | afternoon | 1 | 1 | PASS |
| `opt.period.evening` | Evening | सायंकाल | the evening | 0.94 | 1 | PASS |
| `opt.period.night` | Night | रात | night | 1 | 1 | PASS |
| `opt.season.spring` | Spring | वसंत ऋतु | Spring season | 0.87 | 1 | PASS |
| `opt.season.summer` | Summer | ग्रीष्म ऋतु | Summer season | 0.91 | 1 | PASS · LONG |
| `opt.season.monsoon` | Rainy season | बारिश का मौसम | Rainy season | 1 | 1 | PASS |
| `opt.season.autumn` | Autumn | शरद ऋतु | Autumn | 1 | 1 | PASS |
| `opt.season.winter` | Winter | सर्दी का मौसम | Winter season | 0.9 | 1 | PASS · LONG |
| `opt.weekday.sunday` | Sunday | रविवार | Sunday's | 0.86 | 1 | PASS |
| `opt.weekday.monday` | Monday | सोमवार | Monday | 1 | 1 | PASS |
| `opt.weekday.tuesday` | Tuesday | मंगलवार | tuesday | 1 | 1 | PASS |
| `opt.weekday.wednesday` | Wednesday | बुधवार | wednesday | 1 | 1 | PASS |
| `opt.weekday.thursday` | Thursday | गुरुवार | thursday | 1 | 1 | PASS |
| `opt.weekday.friday` | Friday | शुक्रवार | Friday's | 0.88 | 1 | PASS |
| `opt.weekday.saturday` | Saturday | शनिवार | saturday | 1 | 1 | PASS |
| `opt.month.january` | January | जनवरी | January | 1 | 1 | PASS |
| `opt.month.february` | February | फरवरी | February | 1 | 1 | PASS |
| `opt.month.march` | March | मार्च | March | 1 | 1 | PASS |
| `opt.month.april` | April | अप्रैल | April | 1 | 1 | PASS |
| `opt.month.may` | May | मई | May | 1 | 1 | PASS |
| `opt.month.june` | June | जून | June | 1 | 1 | PASS |
| `opt.month.july` | July | जुलाई | July | 1 | 1 | PASS |
| `opt.month.august` | August | अगस्त | August | 1 | 1 | PASS |
| `opt.month.september` | September | सितंबर | September | 1 | 1 | PASS |
| `opt.month.october` | October | अक्टूबर | October | 1 | 1 | PASS |
| `opt.month.november` | November | नवंबर | November | 1 | 1 | PASS |
| `opt.month.december` | December | दिसंबर | December | 1 | 1 | PASS |
| `done.today` | Today | आज | today's | 0.81 | 1 | PASS |
| `done.date` | Date | तिथि | Date | 1 | 1 | PASS |
| `done.season` | Season | मौसम | weather | 0.39 | 0 | FAIL |
| `done.time_of_day` | Time of day | दिन का समय | Time of day | 1 | 1 | PASS |
| `opt.bucket.kitchen` | Kitchen | रसोईघर | Kitchen | 1 | 1 | PASS |
| `opt.bucket.getting_ready` | Getting ready | तैयार हो रहे हैं | Getting ready | 1 | 1 | PASS |
| `opt.bucket.around_house` | Elsewhere in the house | घर में कहीं और | somewhere else in the house | 0.89 | 0.5 | PASS |
| `item.reg_tumbler` | Steel tumbler | स्टील टम्बलर | Steel Tumbler | 1 | 1 | PASS |
| `item.reg_kettle` | Tea kettle | चाय की केतली | Tea kettle | 1 | 1 | PASS |
| `item.reg_thali` | Thali plate | थाली प्लेट | Thali plate | 1 | 1 | PASS |
| `item.reg_ghoti` | Water pot | पानी का बर्तन | water container | 0.65 | 0.5 | PASS |
| `item.reg_comb` | Comb | कंघी | comb | 1 | 1 | PASS |
| `item.reg_mirror` | Hand mirror | हाथ का दर्पण | Mirror of the hand | 0.91 | 1 | PASS |
| `item.reg_slipper` | Slippers | चप्पलें | Slippers | 1 | 1 | PASS |
| `item.reg_jhola` | Cloth bag | कपड़े का थैला | cloth bag | 1 | 1 | PASS |
| `item.reg_umbrella` | Japi hat | जापी टोपी | Japi hat | 1 | 1 | PASS |
| `item.reg_broom` | Broom | झाड़ू | broom | 1 | 1 | PASS |
| `item.reg_torch` | Torch | मशाल | torch | 1 | 1 | PASS |
| `item.reg_keylock` | Lock and key | ताला और कुंजी | Lock and key | 1 | 1 | PASS |
| `item.reg_lamp` | Diya lamp | दीया लैंप | Diya lamp | 1 | 1 | PASS |
| `item.reg_stool` | Mora stool | मोरा स्टूल | Mora stool | 1 | 1 | PASS |
| `item.reg_pankha` | Hand fan | हाथ का पंखा | hand fan | 1 | 1 | PASS |
| `item.reg_basket` | Bamboo basket | बाँस की टोकरी | Bamboo basket | 1 | 1 | PASS |
| `item.reg_dhekia` | Dhekia greens | ढेकिया ग्रीन्स | Dhekia Greens | 1 | 1 | PASS |
| `item.reg_claypot` | Earthen water pot | मिट्टी के पानी का बर्तन | earthen water pot | 1 | 1 | PASS |
| `item.reg_areca` | Areca nut plate | सुपारी प्लेट | areca nut plate | 1 | 1 | PASS |
| `item.reg_ricepot` | Rice pot | चावल का बर्तन | rice bowl | 0.7 | 0.5 | PASS |
| `item.reg_gamosa` | Gamosa | गमोसा | Gamosa | 1 | 1 | PASS |
| `item.reg_xorai` | Brass offering tray | पीतल की पेशकश ट्रे | Brass offering tray | 1 | 1 | PASS |
| `item.reg_net` | Fishing net | मछली पकड़ने का जाल | fishing net | 1 | 1 | PASS |
| `item.reg_loom` | Weaving loom | बुनाई करघा | Weaving loom | 1 | 1 | PASS |
| `routine.reg_morning_routine` | Morning routine | सुबह की दिनचर्या | Morning routine | 1 | 1 | PASS |
| `step.reg_morning_routine.wake` | Wake up | जागो | wake up | 1 | 1 | PASS |
| `step.reg_morning_routine.medicine` | Take medicine | दवा लें | Take your medicine | 0.91 | 1 | PASS |
| `step.reg_morning_routine.wash` | Wash your face | अपना चेहरा धोएँ | Wash your face | 1 | 1 | PASS |
| `step.reg_morning_routine.breakfast` | Have breakfast | नाश्ता करें | Have breakfast | 1 | 1 | PASS |
| `routine.reg_afternoon_routine` | Afternoon routine | दोपहर की दिनचर्या | Afternoon routine | 1 | 1 | PASS |
| `step.reg_afternoon_routine.rest` | Sit and rest | बैठ कर आराम करें | Sit down and relax | 0.72 | 0.5 | PASS |
| `step.reg_afternoon_routine.tea` | Have tea | चाय पियें | Drink tea | 0.87 | 0.5 | PASS |
| `step.reg_afternoon_routine.walk` | Short walk | छोटी पैदल यात्रा | A short walk | 0.96 | 1 | PASS |
| `step.reg_afternoon_routine.water` | Drink water | पानी पियें | Drink water | 1 | 1 | PASS |
| `routine.reg_evening_routine` | Evening routine | शाम की दिनचर्या | Evening routine | 1 | 1 | PASS |
| `step.reg_evening_routine.wash_up` | Wash your hands | अपने हाथ धोएँ | Wash your hands | 1 | 1 | PASS |
| `step.reg_evening_routine.dinner` | Have dinner | रात का खाना खाओ | have dinner | 1 | 1 | PASS |
| `step.reg_evening_routine.lock_up` | Lock the door | दरवाज़ा बंद करो | close the door | 0.73 | 0.5 | PASS |
| `step.reg_evening_routine.sleep` | Turn off the lamp | बत्ती बंद कर दें | turn the lights off | 0.71 | 0.67 | PASS |
| `routine.reg_prayer_routine` | Evening prayer | शाम की प्रार्थना | The Evening Prayer | 0.96 | 1 | PASS |
| `step.reg_prayer_routine.light` | Light the lamp | दीपक जलाएँ | light the lamp | 1 | 1 | PASS |
| `step.reg_prayer_routine.sit` | Sit on the mat | चटाई पर बैठें | Sit on the mat | 1 | 1 | PASS |
| `step.reg_prayer_routine.pray` | Say the prayer | प्रार्थना करें | Pray | 0.75 | 0 | PASS |
| `step.reg_prayer_routine.put_out` | Put out the lamp | बत्ती बुझा दो | turn the lights off | 0.55 | 0 | FAIL |
| `routine.reg_bath_routine` | Bath time | नहाने का समय | Time for a shower | 0.66 | 0.5 | PASS |
| `step.reg_bath_routine.fetch` | Fetch water | पानी लाएँ | Bring water | 0.61 | 0.5 | PASS |
| `step.reg_bath_routine.wash` | Soap and wash | साबुन और धोना | Soap and wash | 1 | 1 | PASS |
| `step.reg_bath_routine.dry` | Dry with the gamosa | गमोसा से सुखाएँ | Dry with Gamosa | 0.97 | 1 | PASS |
| `step.reg_bath_routine.dress` | Change clothes | कपड़े बदलें | Change your clothes | 0.96 | 1 | PASS |
| `together.childhood.theme` | Childhood | बचपन | Childhood | 1 | 1 | PASS |
| `together.childhood.q` | Tell me about the house where you lived as a child. | मुझे उस घर के बारे में बताएँ जहाँ आप बचपन में रहते थे। | Tell me about the house where you lived as a child. | 1 | 1 | PASS |
| `together.childhood.follow` | Who lived there with you? | वहाँ आपके साथ कौन रहता था? | Who lived there with you? | 1 | 1 | PASS |
| `together.food.theme` | Food | भोजन | food | 1 | 1 | PASS |
| `together.food.q` | What was your favourite food as a child? | बचपन में आपका पसंदीदा भोजन क्या था? | What was your favorite food as a child? | 0.97 | 0.83 | PASS |
| `together.food.follow` | Who used to cook it for you? | इसे आपके लिए कौन पकाता था? | Who cooked it for you? | 0.88 | 0.33 | PASS |
| `together.festivals.theme` | Festivals | त्यौहार | festival | 0.9 | 0 | PASS |
| `together.festivals.q` | How did your family celebrate Bihu or a festival you love? | आपके परिवार ने बिहू या आपके पसंदीदा त्योहार को कैसे मनाया? | How did your family celebrate Bihu or your favourite festival? | 0.98 | 0.86 | PASS |
| `together.festivals.follow` | What did you wear on that day? | उस दिन आपने क्या पहना था? | What did you wear that day? | 0.97 | 1 | PASS |
| `together.music.theme` | Music | संगीत | Music | 1 | 1 | PASS |
| `together.music.q` | Which song do you remember singing when you were young? | आपको बचपन में कौन सा गीत गाना याद है? | What song do you remember singing as a child? | 0.93 | 0.43 | PASS |
| `together.music.follow` | Can you sing a little of it? | क्या आप इसे थोड़ा गा सकते हैं? | Can you sing it a little? | 0.95 | 1 | PASS |
| `together.work.theme` | Work with your hands | अपने हाथों से काम करें | Work with your hands | 1 | 1 | PASS |
| `together.work.q` | What work did you enjoy doing with your hands? | आपको अपने हाथों से कौन सा काम करने में मज़ा आया? | What did you enjoy doing with your hands? | 0.91 | 0.86 | PASS |
| `together.work.follow` | Who taught you how to do it? | आपको यह करना किसने सिखाया? | Who taught you to do this? | 0.86 | 0.67 | PASS |
| `together.places.theme` | Places | जगहें | Places | 1 | 1 | PASS |
| `together.places.q` | Where is a place that made you feel happy? | ऐसी कौन सी जगह है जहाँ आपको खुशी मिलती हो? | Where do you find happiness? | 0.7 | 0.2 | FAIL |
| `together.places.follow` | What could you see and hear there? | आप वहाँ क्या देख और सुन सकते थे? | What could you see and hear there? | 1 | 1 | PASS |
| `together.tea_time.theme` | Tea time | चाय का समय | Tea time | 1 | 1 | PASS |
| `together.tea_time.q` | Do you like your tea with milk or without milk? | क्या आपको दूध के साथ चाय पसंद है या बिना दूध के? | Do you like tea with or without milk? | 0.98 | 1 | PASS |
| `together.tea_time.follow` | Who do you enjoy having tea with? | आपको किसके साथ चाय पीना अच्छा लगता है? | Who do you like to have tea with? | 0.95 | 0.6 | PASS |
| `together.friends.theme` | Friends | दोस्त | friend | 0.69 | 0 | FAIL |
| `together.friends.q` | Tell me about a good friend from when you were young. | मुझे एक अच्छे दोस्त के बारे में बताएँ जब आप छोटे थे। | Tell me about a good friend you had when you were younger. | 0.91 | 0.78 | PASS |
| `together.friends.follow` | What did you do together? | आपने एक साथ क्या किया? | What did you do together? | 1 | 1 | PASS |
| `q.sort_home.where` | Where should this go? | यह कहाँ जाना चाहिए? | Where should it go? | 0.91 | 1 | PASS |
| `q.hear_find.listen` | Listen, then find | सुनो, फिर ढूँढो | Listen, then find out | 0.8 | 1 | PASS |
| `q.hear_find.look` | Find this picture | इस तस्वीर को ढूंढें | Find this picture | 1 | 1 | PASS |
| `q.next_step.first` | What do you do first? | आप पहले क्या करते हैं? | What do you do first? | 1 | 1 | PASS |
| `q.next_step.after` | What do you do next? | आप आगे क्या करेंगे? | What will you do next? | 0.85 | 1 | PASS |
| `q.apon_mukh.find_pairs` | Find the two cards that match | मेल खाने वाले दो कार्ड ढूंढें | Find two matching cards | 0.92 | 0.75 | PASS |
| `q.saah_pat.find_sprigs` | Find every tea shoot like this one | इस तरह के हर चाय के अंकुर को ढूंढें | Find every such tea bud | 0.75 | 0.5 | PASS |
| `q.saah_pat.left` | Tea shoots still to find | चाय के अंकुर अभी भी मिलने बाकी हैं | Tea shoots are still to be found | 0.95 | 0.75 | PASS |
| `q.saah_pat.all_found` | All found | सभी पाए गए | All of them were found | 0.59 | 1 | PASS |
| `notice.some_family` | Some of these are your family's own photos. | इनमें से कुछ आपके परिवार की अपनी तस्वीरें हैं। | Some of these are your family's own photos. | 1 | 1 | PASS |
| `notice.visual_mode` | Read the word, then find its picture. | शब्द को पढ़ें, फिर उसका चित्र खोजें। | Read the word, then find its picture. | 1 | 1 | PASS |
| `notice.family_routine` | Your family's own routine | आपके परिवार की अपनी दिनचर्या | Your family's own routine | 1 | 1 | PASS |
| `notice.routine_generic` | A family can add their own routine in the Memory Garden. | मेमोरी गार्डन में एक परिवार अपनी दिनचर्या जोड़ सकता है। | A family can add their own routine to the Memory Garden. | 0.99 | 1 | PASS |
| `notice.family_photos` | These are your family's own pictures. | ये आपके परिवार की अपनी तस्वीरें हैं। | These are your family's own photos. | 0.98 | 0.8 | PASS |
| `notice.add_photos` | A family can add their own photos in the Memory Garden. | एक परिवार मेमोरी गार्डन में अपनी खुद की तस्वीरें जोड़ सकता है। | A family can add their own photos to the Memory Garden. | 0.99 | 1 | PASS |
| `game.here_all` | Here are all the pairs. | यहाँ सभी जोड़े हैं। | Here are all the pairs. | 1 | 1 | PASS |
| `game.here_others` | Here are the others. | यहाँ अन्य हैं। | Here are others. | 0.91 | 1 | PASS |
| `game.play_again` | Play again | फिर से खेलो | play again | 1 | 1 | PASS |
| `game.more_activities` | More activities | और भी गतिविधियाँ | Other activities | 0.84 | 0.5 | PASS |
| `next.same` | Next time it will be the same. | अगली बार भी ऐसा ही होगा। | The same will happen next time. | 0.72 | 1 | PASS |
| `next.more` | Next time it will be a little harder. | अगली बार यह थोड़ा कठिन होगा। | Next time it will be a little harder. | 1 | 1 | PASS |
| `next.gentler` | Next time it will be a little easier. | अगली बार यह थोड़ा आसान होगा। | Next time it will be a little easier. | 1 | 1 | PASS |
| `next.with_help` | Next time there will be some help. | अगली बार कुछ मदद मिलेगी। | There will be some help next time. | 0.92 | 1 | PASS |
| `together.who` | Who is here? What do you remember about this? | यहाँ कौन है? इस बारे में आपको क्या याद है? | Who's here? What do you remember about this? | 0.95 | 1 | PASS |
| `together.thanks` | Thank you for sharing. | साझा करने के लिए धन्यवाद। | Thanks for sharing. | 0.91 | 0.5 | PASS |
| `together.done_note` | Talking about memories is good for the mind and the heart. There is no score here. | यादों के बारे में बात करना मन और दिल के लिए अच्छा होता है। यहाँ कोई अंक नहीं है। | Talking about memories is good for the mind and heart. There are no numbers here. | 0.8 | 0.88 | PASS |
| `together.done` | Finish talking | बात खत्म करें | end the talk | 0.81 | 0 | PASS |
| `together.tell_more` | Tell me more | मुझे और बताइए | Tell me more | 1 | 1 | PASS |
| `together.another` | Another topic | एक और विषय | Another topic | 1 | 1 | PASS |
| `together.reject` | I don't want to see this again | मैं इसे फिर से नहीं देखना चाहता | I don't want to see it again | 0.88 | 1 | PASS |
| `together.reject_confirm` | Tap again to remove this forever | इसे हमेशा के लिए हटाने के लिए फिर से दबाएँ | Press again to permanently remove it | 0.76 | 0.5 | PASS |
| `together.add_photos` | A family member can add real photos and voice notes in the Memory Garden. | परिवार का कोई सदस्य मेमोरी गार्डन में वास्तविक तस्वीरें और वॉयस नोट्स जोड़ सकता है। | A family member can add actual photos and voice notes to the Memory Garden. | 0.98 | 0.9 | PASS |
| `play.subtitle` | Short, easy games. There are no wrong answers. | छोटे, आसान खेल। कोई गलत जवाब नहीं हैं। | Small, easy games. There are no wrong answers. | 0.87 | 0.83 | PASS |
| `reminder.overdue` | Past the time | समय बीत गया | Time has passed | 0.51 | 0.5 | PASS |
| `reminder.next_up` | Coming next | अगला आ रहा है | The next one is coming | 0.78 | 1 | PASS |
| `reminder.none` | No reminders set yet | अभी तक कोई अनुस्मारक सेट नहीं किया गया है | No reminder has been set yet | 0.92 | 0.75 | PASS · LONG |
| `reminder.none_help` | A family member or health worker can add medicine, water, activity and clinic reminders in Circle. | परिवार का कोई सदस्य या स्वास्थ्य कार्यकर्ता सर्कल में दवा, पानी, गतिविधि और क्लिनिक अनुस्मारक जोड़ सकता है। | A family member or healthcare worker can add medicine, water, activity, and clinic reminders to the circle. | 0.94 | 0.92 | PASS |
| `reminder.not_armed` | Reminders are not set up on this phone. | इस फोन पर रिमाइंडर सेट नहीं किए गए हैं। | Reminders are not set on this phone. | 0.96 | 0.8 | PASS |
| `reminder.now` | Now | अब | Now | 1 | 1 | PASS |
| `reminder.snoozed` | Again in 10 minutes | 10 मिनट में फिर से | again in 10 minutes | 1 | 1 | PASS |
| `reminder.done_state` | Done for today | आज के लिए किया गया | done for today | 1 | 1 | PASS |
| `reminder.more_later` | more reminders later today | आज बाद में और अनुस्मारक | More reminders later today | 1 | 1 | PASS |
| `reminder.all_done` | All reminders are done for today. | आज के लिए सभी अनुस्मारक बनाए गए हैं। | All reminders have been made for today. | 0.92 | 0.75 | PASS |
| `today.is` | Today | आज | today's | 0.81 | 1 | PASS |
| `today.played` | Games played today | आज खेले जाने वाले खेल | Games to be played today | 0.89 | 1 | PASS |
| `today.nothing_yet` | No games played yet today. | आज तक कोई खेल नहीं खेला गया। | No games have been played to date. | 0.7 | 0.6 | PASS |
| `home.circle.one` | person who cares for you | वह व्यक्ति जो आपकी परवाह करता है | The person who cares about you | 0.94 | 1 | PASS |
| `home.circle.many` | people who care for you | जो लोग आपकी परवाह करते हैं | People who care about you | 0.95 | 1 | PASS |
| `why.title` | Why these activities | क्यों होती हैं ये गतिविधियाँ | Why do these activities take place | 0.89 | 1 | PASS |
| `why.intro` | Each activity works on one kind of thinking. This page says what each one is for. | प्रत्येक गतिविधि एक प्रकार की सोच पर काम करती है। यह पृष्ठ बताता है कि प्रत्येक किस लिए है। | Each activity works on a type of thinking. This page explains what each one is for. | 0.96 | 0.78 | PASS |
| `why.works_on` | What it works on | यह किस पर काम करता है | What it works on | 1 | 1 | PASS |
| `why.similar_to` | What it is similar to | यह किसके समान है | Who is it similar to | 0.81 | 0.5 | PASS |
| `why.not_a_test` | SAATH is a tool for daily activities. It is not a medical test. It gives no score and no result. An activity that looks like a memory test is not the same as a memory test. | साथ दैनिक गतिविधियों के लिए एक उपकरण है। यह कोई चिकित्सीय परीक्षण नहीं है। यह कोई अंक नहीं देता और न ही कोई परिणाम देता है। एक गतिविधि जो स्मृति परीक्षण की तरह दिखती है, स्मृति परीक्षण के समान नहीं है। | It is a tool for daily activities. It is not a medical test. It does not give any score and does not give any result. An activity that looks like a memory test is not the same as a memory test. | 0.71 | 0.82 | PASS |
| `why.ask_doctor` | For any question about health, please speak to a doctor or a health worker. | स्वास्थ्य के बारे में किसी भी प्रश्न के लिए, कृपया डॉक्टर या स्वास्थ्य कार्यकर्ता से बात करें। | For any questions about health, please talk to a doctor or health worker. | 0.96 | 0.75 | PASS |
| `why.familiar_pairs.works_on` | Knowing the time of day, the day and the season | दिन के समय, दिन और मौसम को जानना | Knowing the time of day, day, and weather | 0.77 | 0.75 | PASS |
| `why.familiar_pairs.similar_to` | The orientation questions used in common memory checks | सामान्य स्मृति जाँच में उपयोग किए जाने वाले अभिविन्यास प्रश्न | Orientation questions used in general memory testing | 0.85 | 0.67 | PASS |
| `why.familiar_pairs.reason` | Talking about today keeps a person joined to the present day. | आज के बारे में बात करने से व्यक्ति आज तक जुड़ा रहता है। | Talking about today keeps the person connected till today. | 0.83 | 0.63 | PASS |
| `why.sound_sight.works_on` | Understanding a spoken word and matching it to a picture | एक बोले गए शब्द को समझना और उसे एक चित्र से मिलान करना | Understanding a spoken word and matching it to a picture | 1 | 1 | PASS |
| `why.sound_sight.similar_to` | Naming and listening tasks | नामकरण और सुनने के कार्य | Naming and Listening Functions | 0.73 | 0.67 | PASS |
| `why.sound_sight.reason` | Matching a spoken word to its picture keeps words and objects connected. | किसी बोले गए शब्द का उसके चित्र से मिलान करने से शब्द और वस्तुएँ जुड़ी रहती हैं। | Matching a spoken word with its picture keeps words and objects connected. | 0.99 | 1 | PASS |
| `why.pattern_garden.works_on` | Planning, and putting things into groups | योजना बनाना, और चीजों को समूहों में डालना | Planning, and putting things into groups | 1 | 1 | PASS |
| `why.pattern_garden.similar_to` | Sorting tasks that group objects by type | प्रकार के अनुसार वस्तुओं को समूहबद्ध करने वाले कार्यों को क्रमबद्ध करना | Sorting functions that group objects by type | 0.71 | 0.83 | PASS |
| `why.pattern_garden.reason` | Sorting household things uses the same thinking as ordinary housework. | घरेलू चीजों को छांटना सामान्य घरेलू काम के समान सोच का उपयोग करता है। | Sorting household items uses the same kind of thinking as normal housework. | 0.97 | 0.78 | PASS |
| `why.my_next_step.works_on` | Putting the steps of a task in the right order | किसी कार्य के चरणों को सही क्रम में रखना | Keeping the steps of a task in the correct order | 0.96 | 0.6 | PASS |
| `why.my_next_step.similar_to` | Ordering and sequencing tasks | आदेश और अनुक्रमण कार्य | Order and Sequencing Tasks | 0.98 | 0.67 | PASS |
| `why.my_next_step.reason` | A daily routine is easier when the order of its steps stays familiar. | एक दैनिक दिनचर्या तब आसान हो जाती है जब उसके कदमों का क्रम परिचित रहता है। | A daily routine becomes easier when its sequence of steps is familiar. | 0.91 | 0.78 | PASS |
| `why.saah_pat.works_on` | Looking carefully, and staying with one task | ध्यान से देखें, और एक काम के साथ रहें | Look carefully, and stick with one task | 0.83 | 0.67 | PASS |
| `why.saah_pat.similar_to` | Search tasks where one shape must be found among many | ऐसे कार्यों को खोजें जहाँ कई के बीच एक आकार पाया जाना चाहिए | Find functions where one size should be found among many | 0.5 | 0.56 | PASS |
| `why.saah_pat.reason` | Looking for tea shoots is work many people here have done all their lives. | चाय के अंकुरों की तलाश करना एक काम है जो यहाँ के कई लोगों ने अपने पूरे जीवन में किया है। | Searching for tea shoots is a task that many people here have done throughout their lives. | 0.88 | 0.73 | PASS |
| `why.apon_mukh.works_on` | Knowing faces, and remembering people | चेहरों को जानना और लोगों को याद रखना | Knowing faces and remembering people | 0.98 | 1 | PASS |
| `why.apon_mukh.similar_to` | Tasks that join a face to a name | ऐसे कार्य जो किसी नाम के चेहरे को जोड़ते हैं | Functions that connect the faces of a name | 0.65 | 0.25 | FAIL |
| `why.apon_mukh.reason` | Family photographs bring back memories that a drawing cannot. | पारिवारिक तस्वीरें उन यादों को वापस लाती हैं जो एक चित्र नहीं ले सकता है। | Family photos bring back memories that a picture can't. | 0.82 | 0.57 | PASS |
| `why.together.works_on` | Talking with family about earlier days | परिवार से पहले के दिनों के बारे में बात करते हुए | Talking about the days before the family | 0.79 | 0.67 | PASS |
| `why.together.similar_to` | Reminiscence work used in group care | समूह देखभाल में उपयोग किया जाने वाला स्मृति कार्य | Memory function used in group care | 0.61 | 0.6 | PASS |
| `why.together.reason` | Talking about earlier days together is calming, and needs no right answer. | पहले के दिनों के बारे में एक साथ बात करना शांत है, और किसी सही जवाब की आवश्यकता नहीं है। | It's cool to talk about the days before together, and no correct answers are needed. | 0.75 | 0.4 | PASS |
| `privacy.title` | What we keep, and where | हम क्या रखते हैं, और कहाँ | What we keep, and where | 1 | 1 | PASS |
| `privacy.on_device` | Everything stays on this phone. The app works with no internet. | सब कुछ इस फोन पर रहता है। ऐप बिना इंटरनेट के काम करता है। | Everything stays on this phone. The app works without the internet. | 0.98 | 0.75 | PASS |
| `privacy.stored_title` | What is kept on this phone | इस फोन में क्या रखा हुआ है | what's in this phone | 0.75 | 0.67 | PASS |
| `privacy.stored_list` | The name and age of the person, family photographs and voice notes, reminders, care notes, and a record of each activity. | व्यक्ति का नाम और उम्र, पारिवारिक तस्वीरें और वॉयस नोट्स, अनुस्मारक, देखभाल नोट्स और प्रत्येक गतिविधि का रिकॉर्ड। | The person's name and age, family photos and voice notes, reminders, care notes, and a record of each activity. | 0.94 | 0.92 | PASS |
| `privacy.locked_title` | What is locked | क्या बंद है | What's closed | 0.32 | 0.5 | PASS |
| `privacy.locked` | The name, the care plan text, the care notes, the photographs and the voice notes are locked with AES-256-GCM encryption while they sit on this phone. The key is made on this phone and kept in the phone secure store. | नाम, देखभाल योजना पाठ, देखभाल टिप्पणियाँ, तस्वीरें और वॉयस नोट्स इस फोन पर बैठने के दौरान एईएस-256-जीसीएम एन्क्रिप्शन के साथ लॉक किए जाते हैं। चाबी इस फोन पर बनाई जाती है और फोन की सुरक्षित दुकान में रखी जाती है। | Names, care plan text, care notes, photos, and voice notes are locked with AES-256-GCM encryption while sitting on this phone. The key is generated on this phone and stored in the phone's safe. | 0.91 | 0.62 | PASS |
| `privacy.leaves_title` | What leaves this phone | इस फोन से क्या निकलता है | what comes out of this phone | 0.82 | 0.67 | PASS |
| `privacy.leaves` | Nothing leaves this phone unless a family member turns on syncing. | जब तक परिवार का कोई सदस्य सिंकिंग चालू नहीं करता है तब तक इस फोन से कुछ भी नहीं निकलता है। | Nothing comes out of this phone unless a family member turns on syncing. | 0.85 | 0.88 | PASS |
| `privacy.sync_on` | When syncing is on, only the record of the activities is sent: which activity, when, and how it went. Photographs, voice notes, names and care notes are never sent. | जब सिंकिंग चालू होती है, तो केवल गतिविधियों का रिकॉर्ड भेजा जाता हैः कौन सी गतिविधि, कब और कैसे हुई। फोटो, वॉयस नोट, नाम और देखभाल नोट कभी नहीं भेजे जाते हैं। | When syncing is turned on, only the record of activities is sent: which activity, when, and how it occurred. Photos, voice notes, names, and care notes are never sent. | 0.96 | 0.88 | PASS |
| `privacy.delete_title` | How to remove everything | कैसे सब कुछ हटाने के लिए | How to get rid of everything | 0.81 | 0.67 | PASS |
| `privacy.delete_how` | The button below removes every person on this phone, with their photographs, voice notes, reminders, notes and activity records. | नीचे दिया गया बटन इस फोन पर हर व्यक्ति को उनकी तस्वीरों, वॉयस नोट्स, अनुस्मारकों, नोट्स और गतिविधि रिकॉर्ड के साथ हटा देता है। | The button at the bottom deletes every person on this phone along with their photos, voice notes, reminders, notes, and activity records. | 0.86 | 0.79 | PASS |
| `privacy.delete_button` | Remove everything from this phone | इस फोन से सब कुछ हटा दें | Remove everything from this phone | 1 | 1 | PASS |
| `privacy.delete_confirm` | Tap again to remove everything | सब कुछ हटाने के लिए फिर से दबाएँ | Press again to remove everything | 0.76 | 0.75 | PASS |
| `privacy.deleted` | Everything has been removed from this phone. | इस फोन से सब कुछ हटा दिया गया है। | Everything has been removed from this phone. | 1 | 1 | PASS |
| `privacy.dpdp` | India's Digital Personal Data Protection Act, 2023 asks that personal data is kept safely, and only for as long as it is needed. This page says what the app does. It is not a claim of certification. | भारत का डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 कहता है कि व्यक्तिगत डेटा को सुरक्षित रूप से रखा जाए, और केवल तब तक जब तक इसकी आवश्यकता हो। यह पृष्ठ बताता है कि ऐप क्या करता है। यह प्रमाणन का दावा नहीं है। | India's Digital Personal Data Protection Act, 2023 states that personal data be kept securely, and only for as long as it is needed. This page explains what the app does. This is not a claim for certification. | 0.97 | 0.86 | PASS |
| `mood.question` | How do you feel now? | अब आप कैसा महसूस कर रहे हैं? | How are you feeling now? | 0.89 | 0.67 | PASS |
| `mood.good` | Good | अच्छा है | it's good | 0.67 | 1 | PASS · LONG |
| `mood.ok` | All right | ठीक है | Okay | 0.48 | 0 | FAIL |
| `mood.low` | Not good | अच्छा नहीं है | It's not good | 0.75 | 1 | PASS |
| `strip.usual` | This week is about the same as usual for this person. | इस व्यक्ति के लिए यह सप्ताह लगभग हमेशा की तरह ही है। | For this person, this week is almost the same as usual. | 0.95 | 0.83 | PASS |
| `strip.fewer` | Fewer activities this week than usual for this person. | इस व्यक्ति के लिए इस सप्ताह सामान्य से कम गतिविधियाँ हैं। | There are fewer activities than usual this week for this person. | 0.96 | 1 | PASS |
| `strip.more` | More activities this week than usual for this person. | इस व्यक्ति के लिए इस सप्ताह सामान्य से अधिक गतिविधियाँ हैं। | There are more activities than usual this week for this person. | 0.95 | 1 | PASS |
| `strip.quiet` | No activity for three days or more. | तीन दिन या उससे अधिक समय तक कोई गतिविधि नहीं। | No activity for three days or more. | 1 | 1 | PASS |
| `strip.early` | The first days are still being collected. | शुरुआती दिन अभी भी एकत्र किए जा रहे हैं। | The early days are still being collected. | 0.88 | 0.8 | PASS |
| `strip.reminders_down` | Fewer reminders were marked done this week than usual. | इस सप्ताह सामान्य से कम अनुस्मारक चिह्नित किए गए। | This week marked fewer reminders than usual. | 0.94 | 0.75 | PASS |
| `trend.title` | The last 30 days | अंतिम 30 दिन | The last 30 days | 1 | 1 | PASS |
| `trend.days_joined` | of the last 7 days had an activity | पिछले 7 दिनों में एक गतिविधि थी | There was one activity in the last 7 days | 0.94 | 0.75 | PASS |
| `trend.days_before` | in the 7 days before that | उससे पहले के 7 दिनों में | In the 7 days before | 0.93 | 1 | PASS |
| `trend.sessions` | activities in 30 days | 30 दिनों में गतिविधियाँ | Activities in 30 days | 1 | 1 | PASS |
| `trend.unaided` | activities finished with no help this week | इस सप्ताह बिना किसी सहायता के समाप्त गतिविधियाँ | Unassisted activities this week | 0.7 | 0.33 | FAIL |
| `trend.unaided_before` | in the week before | एक सप्ताह पहले | the week before | 0.91 | 1 | PASS |
| `trend.reminders` | of the reminders this week were marked done | इस सप्ताह के अनुस्मारकों को चिह्नित किया गया था | This week's reminders were marked | 0.94 | 0.8 | PASS |
| `trend.too_little` | There is not enough here yet to show a pattern. It fills in as the days go by. | यहाँ अभी तक एक पैटर्न दिखाने के लिए पर्याप्त नहीं है। जैसे-जैसे दिन बीतते जाते हैं यह भर जाता है। | Here it is not yet enough to show a pattern. It fills up as the days go by. | 0.95 | 1 | PASS |
| `trend.each_bar` | Each bar shows one day. | प्रत्येक बार एक दिन दिखाता है। | Each time shows a day. | 0.7 | 0.6 | PASS |
| `trend.observational` | These are counts of what happened. They are not a health measure. | ये जो हुआ उसकी गिनती है। वे स्वास्थ्य संबंधी उपाय नहीं हैं। | This is the countdown to what happened. They are not health-related measures. | 0.8 | 0.63 | PASS |
| `trend.mood_said` | How this person said they felt after an activity | इस व्यक्ति ने कैसे कहा कि उन्होंने एक गतिविधि के बाद महसूस किया | How this person said they felt after an activity | 1 | 1 | PASS |
| `day.title` | How today went | आज कैसा रहा | how was today | 0.88 | 0.67 | PASS |
| `day.activities` | activities today | आज की गतिविधियाँ | Today's activities | 0.94 | 1 | PASS |
| `day.no_help` | of them finished with no help | उनमें से बिना किसी मदद के समाप्त हो गए | of them ended up without any help | 0.76 | 0.4 | PASS |
| `day.reminders` | of the reminders for today are marked done | आज के लिए अनुस्मारक चिह्नित किए गए हैं | reminders have been marked for today | 0.9 | 0.75 | PASS |
| `day.nothing` | Nothing has been recorded today yet. | आज तक कुछ भी दर्ज नहीं किया गया है। | Nothing has been recorded to date. | 0.82 | 0.67 | PASS |

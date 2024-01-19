import { process_tbm_data, send_messages } from './utility.js'

const produceMessages = async () => {
  //while (true) {
    //await process_tbm_data()
    
  //}
  let arr_messages1 = []
  let arr_messages2 = []
  for (let i = 0; i < 10; i++) {
    arr_messages1.push({ value: `Message tbm01 0${i}` })
  }
  await send_messages("tbm1", arr_messages1)
  for (let i = 0; i < 10; i++) {
    arr_messages2.push({ value: `Message tbm02 0${i}` })
  }
  await send_messages("tbm2", arr_messages2)
};

// Call the async function to produce messages
produceMessages();
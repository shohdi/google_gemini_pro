// node --version # Should be >= 18
// npm install @google/generative-ai

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

let chat = null;

const MODEL_NAME = "gemini-1.0-pro";


async function runChat(API_KEY) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  let chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
    ],
  });

  //const result = await chat.sendMessage("YOUR_USER_INPUT");
  //const response = result.response;
  //console.log(response.text());
  return chat;
}



async function getMessage(chat, msg) {
  let result = await chat.sendMessage(msg);
  let response = result.response;
  return response;
}


function encode(htmlText) {
  $('#encoder').text(htmlText);
  let ret = $('#encoder').html();

  while (ret.indexOf(' ') >= 0) {
    ret = ret.replace(' ', '&nbsp;');
  }
  while (ret.indexOf('\t') >= 0) {
    ret = ret.replace('\t', '&nbsp;&nbsp;&nbsp;');
  }
  while (ret.indexOf('\n') >= 0) {
    ret = ret.replace('\n', '<br />');
  }
  return ret;
}

function checkApiKey()
{
   if(localStorage['apiKey'] != null )
   {
      let key = localStorage['apiKey'];
      $('#api_key').val(key);
      $('#apiKeyDiv').hide();

   }
}

function saveApiKey()
{
  
  localStorage['apiKey'] = $('#api_key').val();
  //console.log('save run ' + localStorage['apiKey']);
  checkApiKey();
}


$(function () {

  checkApiKey();

  $(document).on('click', '#sendBtn', async function (e) {
    e.preventDefault();
    $('#loadingDiv').show();
    var apiKey = $('#api_key').val();
    if (chat == null) {
      try {
        chat = await runChat(apiKey);
        
      }
      catch (ex) {
        chat = null;
        $('#result').html($('#result').html() + '<br />Error : <br />' + ex.toString() + '<br />');
        $('#loadingDiv').hide();
        return false;
      }

    }
    var youMsg = $('#comment').val();
    $('#comment').val('');
    $('#result').html($('#result').html() + '<br />You : <br />' + youMsg + '<br />');
    let respMessage = '';
    try {
      response = await getMessage(chat, youMsg);
      saveApiKey();

    }
    catch (ex) {
      $('#result').html($('#result').html() + '<br />Error : <br />' + ex.toString() + '<br />');
      $('#loadingDiv').hide();
      return false;
    }
    if (response.candidates != null && response.candidates.length != null) {
      for (let i = 0; i < response.candidates.length; i++) {
        let candContent = response.candidates[i].content;
        if (candContent != null && candContent.parts != null && candContent.parts.length != null) {
          for (let j = 0; j < candContent.parts.length; j++) {
            respMessage = respMessage + '<br />' + encode(candContent.parts[j].text);
          }

        }
      }
    }



    $('#result').html($('#result').html() + '<br />' + MODEL_NAME + ' : <br />' + respMessage + '<br />');

    $('#loadingDiv').hide();
    return false;
  });


  $(document).on('click', '#clearBtn', async function (e) {
    e.preventDefault();
    $('#loadingDiv').show();
    var apiKey = $('#api_key').val();


    try {
      chat = await runChat(apiKey);
    }
    catch (ex) {
      chat = null;
      $('#result').html($('#result').html() + '<br />Error : <br />' + ex.toString() + '<br />');
      $('#loadingDiv').hide();
      return false;
    }


    $('#result').html('');


    $('#loadingDiv').hide();
    return false;
  });
});

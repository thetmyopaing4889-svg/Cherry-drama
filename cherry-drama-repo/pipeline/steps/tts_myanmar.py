"""
tts_myanmar.py — Myanmar narrator voice using Azure Cognitive Services TTS.
Voice: my-MM-ThihaNeural (male, dramatic)
      my-MM-NilarNeural (female, warm) — change VOICE_NAME below to switch
"""
import azure.cognitiveservices.speech as speechsdk

VOICE_NAME = "my-MM-ThihaNeural"
AZURE_REGION = "eastasia"


def generate_myanmar_audio(text: str, azure_key: str, output_path: str) -> None:
    """
    Generate MP3 audio from Myanmar text using Azure TTS.
    Saves the result to output_path (.mp3).
    Raises RuntimeError on failure.
    """
    speech_config = speechsdk.SpeechConfig(subscription=azure_key, region=AZURE_REGION)
    speech_config.speech_synthesis_voice_name = VOICE_NAME
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
    )

    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config,
    )

    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="my-MM">'
        f'<voice name="{VOICE_NAME}">'
        '<prosody rate="0.95" pitch="-2%">'
        f"{_escape_xml(text)}"
        "</prosody>"
        "</voice>"
        "</speak>"
    )

    result = synthesizer.speak_ssml_async(ssml).get()

    if result.reason != speechsdk.ResultReason.SynthesizingAudioCompleted:
        details = result.cancellation_details
        raise RuntimeError(
            f"Azure TTS (Myanmar) failed: {details.error_details or details.reason}"
        )


def _escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )

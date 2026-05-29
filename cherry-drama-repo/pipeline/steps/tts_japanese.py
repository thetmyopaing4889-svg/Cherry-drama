"""
tts_japanese.py — Japanese narrator voice using Azure Cognitive Services TTS.
Voice: ja-JP-NanamiNeural (female, natural)
       ja-JP-KeitaNeural (male) — change VOICE_NAME below to switch

Uses the same Azure key as Myanmar TTS — no additional API key required.
(Replaces Voicevox which requires a local server not available on cloud/Replit)
"""
import azure.cognitiveservices.speech as speechsdk

VOICE_NAME = "ja-JP-NanamiNeural"
AZURE_REGION = "eastasia"


def generate_japanese_audio(text: str, azure_key: str, output_path: str) -> None:
    """
    Generate WAV audio from Japanese text using Azure TTS.
    Saves the result to output_path (.wav).
    Raises RuntimeError on failure.
    """
    speech_config = speechsdk.SpeechConfig(subscription=azure_key, region=AZURE_REGION)
    speech_config.speech_synthesis_voice_name = VOICE_NAME
    speech_config.set_speech_synthesis_output_format(
        speechsdk.SpeechSynthesisOutputFormat.Riff16Khz16BitMonoPcm
    )

    audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config,
    )

    ssml = (
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">'
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
            f"Azure TTS (Japanese) failed: {details.error_details or details.reason}"
        )


def _escape_xml(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )

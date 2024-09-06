# youtube transcript downloader

- youtube url을 인자로 받아서 transcript를 추출하고 이를 클립보드에 복사한다.

## python script

- claude에 아래와 같이 요청

```
python, mac, alfred 전문가로서 답변해줘 

youtube url을 주면 해당 youtube의 trascript을 타임라인 포함해서 클립보드에 저장하는 프로그램을 파이썬으로 작성해줘 
이 프로그램을 검증한 후에 alfred workflow로 만들고 싶어
```

- 몇번의 핑퐁 끝에 만들어진 파이썬 스크립트

```python
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi
import pyperclip

def get_video_id(url):
    if "youtu.be" in url:
        return url.split("/")[-1]
    elif "youtube.com" in url:
        return url.split("v=")[1].split("&")[0]
    else:
        raise ValueError("Invalid YouTube URL")

def get_transcript(video_id):
    try:
        # 먼저 한글 자막을 시도
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['ko'])
        return transcript, 'ko'
    except:
        try:
            # 한글 자막이 없으면 영어 자막을 시도
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
            return transcript, 'en'
        except Exception as e:
            sys.stderr.write(f"Error getting transcript: {str(e)}\n")
            return None, None

def format_transcript(transcript):
    formatted = ""
    for entry in transcript:
        start_time = int(entry['start'])
        minutes, seconds = divmod(start_time, 60)
        formatted += f"{minutes:02d}:{seconds:02d} - {entry['text']}\n"
    return formatted

def output_for_alfred(message, status):
    output = json.dumps({"alfredworkflow": {"arg": message, "variables": {"status": status}}}, ensure_ascii=False)
    sys.stdout.write(output)

def main(url):
    try:
        video_id = get_video_id(url)
        transcript, language = get_transcript(video_id)
        if transcript:
            formatted_transcript = format_transcript(transcript)
            pyperclip.copy(formatted_transcript)
            lang_msg = "한글" if language == 'ko' else "영어"
            output_for_alfred(f"{lang_msg} 자막이 클립보드에 복사되었습니다.", "성공")
        else:
            output_for_alfred("자막을 가져오는데 실패했습니다.", "실패")
    except Exception as e:
        sys.stderr.write(f"Error in main: {str(e)}\n")
        output_for_alfred(f"오류 발생: {str(e)}", "오류")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        output_for_alfred("사용법: python script.py <YouTube URL>", "오류")
    else:
        main(sys.argv[1])
```

## alfred workflow 만들기

![](y2c.png)

1. input / keyword
2. actions / runscript
3. outputs / post notification

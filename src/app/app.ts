import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface Paint {

  id: number;

  color: string;

  x: number;

  y: number;

  size: number;

}


interface DiaryEntry {

  date: string;

  memo: string;

  paints: Paint[];

  /*
    SAVEしたときに作った
    完成済み水彩画像
  */

  image?: string;

}


@Component({

  selector: 'app-root',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './app.html',

  styleUrl: './app.css'

})


export class App {


  screen:
    'start' |
    'diary' |
    'calendar'
    = 'start';


  today = '';

  selectedDate = '';

  memo = '';


  paints: Paint[] = [];

  diaryEntries: DiaryEntry[] = [];


  /*
    現在表示している
    完成済み水彩画像。

    制作途中でも、
    この画像をリアルタイムに作り直して表示する。

    これによって、

    ・制作中
    ・SAVE後
    ・カレンダー

    の3つが同じ画像になる。
  */

  previewImage = '';

  savedImage = '';


  private nextPaintId = 0;


  /*
    wcm.jpgの元画像
  */

  private watercolorSource:
    HTMLImageElement | null = null;


  colors: string[] = [

    '#d9829c',
    '#c9645d',
    '#d58b50',
    '#d1ad4f',
    '#7fa56e',
    '#5e9d96',
    '#668fb7',
    '#8175a9',

    '#ff4f70',
    '#ff7043',
    '#ffc928',
    '#8bcf32',
    '#19b9a5',
    '#2494e8',
    '#7057d9',
    '#e83e9f',

    '#f3a6b8',
    '#f6c58b',
    '#f4df78',
    '#b7d889',
    '#91d5ca',
    '#9bc7e8',
    '#b5a5dc',
    '#ed9acb',

    '#8f3f55',
    '#9b5b28',
    '#315f50',
    '#315b7d',
    '#433c68',
    '#5b4a42'

  ];


  calendarYear =
    new Date().getFullYear();


  calendarMonth =
    new Date().getMonth();


  weekDays = [

    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'

  ];


  constructor() {

    this.updateDate();

    this.loadEntries();

    this.loadWatercolorSource();

  }


  /*
    ========================================
    DATE
    ========================================
  */

  private updateDate(): void {

    const now =
      new Date();


    this.today =
      now.toLocaleDateString(

        'ja-JP',

        {

          year: 'numeric',

          month: 'long',

          day: 'numeric'

        }

      );


    this.selectedDate =
      this.dateKey(now);

  }


  dateKey(
    date: Date
  ): string {

    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;

  }


  /*
    ========================================
    START
    ========================================
  */

  startDiary(): void {

    this.screen =
      'diary';

    this.loadToday();

  }


  /*
    ========================================
    CALENDAR
    ========================================
  */

  openCalendar(): void {

    this.screen =
      'calendar';


    this.calendarYear =
      new Date().getFullYear();


    this.calendarMonth =
      new Date().getMonth();

  }


  backToDiary(): void {

    this.screen =
      'diary';

    this.loadToday();

  }


  /*
    ========================================
    LOAD WATERCOLOR SOURCE
    ========================================
  */

  private loadWatercolorSource(): void {

    const image =
      new Image();


    image.src =
      'assets/wcm.jpg';


    image.onload =
      () => {

        this.watercolorSource =
          image;


        /*
          すでに色が置かれている場合は、
          水彩画像が読み込まれたあとに
          プレビューを作り直す。
        */

        if (
          this.paints.length > 0
        ) {

          this.updatePreview();

        }

      };

  }


  /*
    ========================================
    DROP PAINT
    ========================================
  */

  dropPaint(
    color: string
  ): void {


    const paint: Paint = {

      id:
        this.nextPaintId++,

      color,

      x:
        8 +
        Math.random() * 84,

      y:
        8 +
        Math.random() * 84,

      size:
        38 +
        Math.random() * 14

    };


    this.paints = [

      ...this.paints,

      paint

    ];


    /*
      色を追加したら、
      Canvasで完成画像を作り直す。

      CSSのmaskは使わない。
    */

    this.updatePreview();

  }


  /*
    ========================================
    TRACK
    ========================================
  */

  trackPaint(
    index: number,
    paint: Paint
  ): number {

    return paint.id;

  }


  /*
    ========================================
    UPDATE PREVIEW
    ========================================
  */

  private updatePreview(): void {

    if (
      this.paints.length === 0
    ) {

      this.previewImage =
        '';

      return;

    }


    /*
      wcm.jpgがまだ読み込まれていない場合。

      少し待ってから再生成する。
    */

    if (
      !this.watercolorSource
    ) {

      this.previewImage =
        '';

      return;

    }


    this.previewImage =
      this.createWatercolorImage();

  }


  /*
    ========================================
    CREATE WATERCOLOR IMAGE
    ========================================

    ここが水彩画像を作る本体。

    現在SAVEしたときに
    綺麗に表示できている方式をそのまま使用する。

    制作中もこのCanvas画像を表示するので、
    SAVE前後で見た目が変わらない。
  */

  private createWatercolorImage(): string {

    const size = 800;


    const canvas =
      document.createElement(
        'canvas'
      );


    canvas.width =
      size;

    canvas.height =
      size;


    const context =
      canvas.getContext(
        '2d'
      );


    if (!context) {

      return '';

    }


    /*
      紙
    */

    context.fillStyle =
      '#faf7f0';


    context.fillRect(
      0,
      0,
      size,
      size
    );


    /*
      絵具用Canvas
    */

    const paintCanvas =
      document.createElement(
        'canvas'
      );


    paintCanvas.width =
      size;

    paintCanvas.height =
      size;


    const paintContext =
      paintCanvas.getContext(
        '2d'
      );


    if (!paintContext) {

      return '';

    }


    /*
      絵具を描く
    */

    this.paints.forEach(
      paint => {

        const x =
          size *
          paint.x /
          100;


        const y =
          size *
          paint.y /
          100;


        const radiusX =
          size *
          paint.size /
          100;


        const hex =
          paint.color.replace(
            '#',
            ''
          );


        const r =
          parseInt(
            hex.substring(0, 2),
            16
          );


        const g =
          parseInt(
            hex.substring(2, 4),
            16
          );


        const b =
          parseInt(
            hex.substring(4, 6),
            16
          );


        const gradient =
          paintContext.createRadialGradient(

            x,
            y,
            0,

            x,
            y,
            radiusX

          );


        gradient.addColorStop(
          0,
          `rgba(${r},${g},${b},1)`
        );


        gradient.addColorStop(
          0.15,
          `rgba(${r},${g},${b},0.97)`
        );


        gradient.addColorStop(
          0.30,
          `rgba(${r},${g},${b},0.82)`
        );


        gradient.addColorStop(
          0.45,
          `rgba(${r},${g},${b},0.58)`
        );


        gradient.addColorStop(
          0.63,
          `rgba(${r},${g},${b},0.28)`
        );


        gradient.addColorStop(
          0.78,
          `rgba(${r},${g},${b},0.07)`
        );


        gradient.addColorStop(
          0.90,
          `rgba(${r},${g},${b},0)`
        );


        /*
          楕円
        */

        paintContext.save();


        paintContext.translate(
          x,
          y
        );


        paintContext.scale(
          1,
          1
        );


        paintContext.translate(
          -x,
          -y
        );


        paintContext.fillStyle =
          gradient;


        paintContext.fillRect(
          0,
          0,
          size,
          size
        );


        paintContext.restore();

      }

    );


    /*
      ========================================
      WATERCOLOR MASK
      ========================================
    */

    if (
      this.watercolorSource
    ) {

      const maskCanvas =
        document.createElement(
          'canvas'
        );


      maskCanvas.width =
        size;

      maskCanvas.height =
        size;


      const maskContext =
        maskCanvas.getContext(
          '2d'
        );


      if (maskContext) {

        maskContext.drawImage(

          this.watercolorSource,

          0,
          0,

          size,
          size

        );


        const paintData =
          paintContext.getImageData(

            0,
            0,
            size,
            size

          );


        const maskData =
          maskContext.getImageData(

            0,
            0,
            size,
            size

          );


        /*
          モノクロのwcm.jpgを
          絵具の透明度として使う。

          色そのものは変更しない。

          重要：
          RGBには触れず、
          Alphaだけを変更する。
        */

        for (

          let i = 0;

          i < paintData.data.length;

          i += 4

        ) {

          const red =
            maskData.data[i];


          const green =
            maskData.data[i + 1];


          const blue =
            maskData.data[i + 2];


          const luminance =

            red * 0.299 +

            green * 0.587 +

            blue * 0.114;


          const darkness =

            Math.max(
              0,
              255 - luminance
            );


          const maskAlpha =

            Math.min(

              1,

              Math.pow(
                darkness / 255,
                0.85
              ) * 1.8

            );


          /*
            RGBは絶対に変更しない。

            Alphaだけ変更する。
          */

          paintData.data[i + 3] =

            Math.round(

              paintData.data[i + 3] *
              maskAlpha

            );

        }


        paintContext.putImageData(

          paintData,

          0,
          0

        );

      }

    }


    /*
      紙に絵具を載せる
    */

    context.drawImage(

      paintCanvas,

      0,
      0

    );


    /*
      紙の質感
    */

    context.fillStyle =
      'rgba(100,90,80,0.025)';


    for (

      let y = 0;

      y < size;

      y += 4

    ) {

      context.fillRect(
        0,
        y,
        size,
        1
      );

    }


    /*
      JPEG画像として完成。
    */

    return canvas.toDataURL(
      'image/jpeg',
      0.88
    );

  }


  /*
    ========================================
    SAVE
    ========================================
  */

  saveCurrentEntry(): void {


    if (

      this.paints.length === 0 &&

      this.memo.trim() === ''

    ) {

      return;

    }


    /*
      現在の完成画像を保存。

      すでにpreviewImageとして
      表示しているものと同じ画像。
    */

    let image =
      this.previewImage;


    /*
      万一previewImageがない場合は
      ここで作る。
    */

    if (
      this.paints.length > 0 &&
      !image
    ) {

      image =
        this.createWatercolorImage();

    }


    /*
      色がない場合は、
      以前保存した画像を維持。
    */

    if (
      this.paints.length === 0 &&
      this.savedImage
    ) {

      image =
        this.savedImage;

    }


    const entry: DiaryEntry = {

      date:
        this.selectedDate,

      memo:
        this.memo,

      paints:
        this.paints.map(
          paint => ({
            ...paint
          })
        ),

      image

    };


    const existing =

      this.diaryEntries.findIndex(

        item =>

          item.date ===
          this.selectedDate

      );


    if (
      existing >= 0
    ) {

      this.diaryEntries[
        existing
      ] = entry;

    } else {

      this.diaryEntries.push(
        entry
      );

    }


    localStorage.setItem(

      'watercolor-diary',

      JSON.stringify(
        this.diaryEntries
      )

    );


    /*
      SAVEした画像を
      現在の表示にも使う。
    */

    this.savedImage =
      image;

    this.previewImage =
      image;

  }
  downloadCurrentEntry(): void {
    fetch(this.previewImage)
  .then(response => response.blob())
  .then(blob => new File([blob], 'image.jpeg'))
  .then(file => {
    //fileはFileオブジェクト
      // BlobやFileから一時的なURLを作成する
      const url = URL.createObjectURL(file);
    
      // aタグを動的に作成する
      const link = document.createElement('a');
      link.href = url;
      link.download = 'watercolor.jpg'; // ダウンロード時のファイル名
    
      // DOMに一時追加してクリックイベントを発生させる
      document.body.appendChild(link);
      link.click();
    
      // 後処理（要素の削除とURLの解放）
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  })

  }

  /*
    ========================================
    LOAD ENTRIES
    ========================================
  */

  private loadEntries(): void {


    const saved =

      localStorage.getItem(
        'watercolor-diary'
      );


    if (
      !saved
    ) {

      return;

    }


    try {

      this.diaryEntries =
        JSON.parse(
          saved
        );


      let maxId = 0;


      this.diaryEntries.forEach(

        entry => {

          entry.paints.forEach(

            paint => {

              if (
                typeof paint.x !==
                'number'
              ) {

                paint.x =
                  8 +
                  Math.random() * 84;

              }


              if (
                typeof paint.y !==
                'number'
              ) {

                paint.y =
                  8 +
                  Math.random() * 84;

              }


              if (
                typeof paint.size !==
                'number'
              ) {

                paint.size =
                  38 +
                  Math.random() * 14;

              }


              if (
                paint.id >=
                maxId
              ) {

                maxId =
                  paint.id + 1;

              }

            }

          );

        }

      );


      this.nextPaintId =
        maxId;


    } catch {

      this.diaryEntries =
        [];

    }

  }


  /*
    ========================================
    LOAD TODAY
    ========================================
  */

  private loadToday(): void {


    this.selectedDate =
      this.dateKey(
        new Date()
      );


    const entry =

      this.diaryEntries.find(

        item =>

          item.date ===
          this.selectedDate

      );


    if (
      entry
    ) {

      this.paints =
        entry.paints || [];


      this.memo =
        entry.memo || '';


      this.savedImage =
        entry.image || '';


      /*
        保存済み画像があれば、
        それをそのまま表示。

        これが重要。
      */

      this.previewImage =
        this.savedImage;

    } else {

      this.paints =
        [];


      this.memo =
        '';


      this.savedImage =
        '';


      this.previewImage =
        '';

    }

  }


  /*
    ========================================
    OPEN ENTRY
    ========================================
  */

  openEntry(
    date: string
  ): void {


    const entry =

      this.diaryEntries.find(

        item =>

          item.date ===
          date

      );


    if (
      !entry
    ) {

      return;

    }


    this.selectedDate =
      date;


    this.paints =
      entry.paints || [];


    this.memo =
      entry.memo || '';


    this.savedImage =
      entry.image || '';


    /*
      カレンダーから開いた場合も
      保存済み画像をそのまま表示。
    */

    this.previewImage =
      this.savedImage;


    this.screen =
      'diary';

  }


  /*
    ========================================
    CLEAR
    ========================================
  */

  resetDiary(): void {


    this.paints =
      [];


    this.memo =
      '';


    this.savedImage =
      '';


    this.previewImage =
      '';


    this.diaryEntries =

      this.diaryEntries.filter(

        entry =>

          entry.date !==
          this.selectedDate

      );


    localStorage.setItem(

      'watercolor-diary',

      JSON.stringify(
        this.diaryEntries
      )

    );

  }


  /*
    ========================================
    CALENDAR TITLE
    ========================================
  */

  get calendarTitle(): string {


    return new Date(

      this.calendarYear,

      this.calendarMonth,

      1

    ).toLocaleDateString(

      'en-US',

      {

        year: 'numeric',

        month: 'long'

      }

    );

  }


  /*
    ========================================
    CALENDAR DAYS
    ========================================
  */

  get calendarDays(): (
    Date | null
  )[] {


    const firstDay =

      new Date(

        this.calendarYear,

        this.calendarMonth,

        1

      ).getDay();


    const daysInMonth =

      new Date(

        this.calendarYear,

        this.calendarMonth + 1,

        0

      ).getDate();


    const result: (
      Date | null
    )[] = [];


    for (

      let i = 0;

      i < firstDay;

      i++

    ) {

      result.push(null);

    }


    for (

      let day = 1;

      day <= daysInMonth;

      day++

    ) {

      result.push(

        new Date(

          this.calendarYear,

          this.calendarMonth,

          day

        )

      );

    }


    return result;

  }


  /*
    ========================================
    PREVIOUS MONTH
    ========================================
  */

  previousMonth(): void {


    if (

      this.calendarMonth === 0

    ) {

      this.calendarMonth =
        11;

      this.calendarYear--;

    } else {

      this.calendarMonth--;

    }

  }


  /*
    ========================================
    NEXT MONTH
    ========================================
  */

  nextMonth(): void {


    if (

      this.calendarMonth === 11

    ) {

      this.calendarMonth =
        0;

      this.calendarYear++;

    } else {

      this.calendarMonth++;

    }

  }


  /*
    ========================================
    HAS ENTRY
    ========================================
  */

  hasEntry(
    date: Date
  ): boolean {


    return this.diaryEntries.some(

      entry =>

        entry.date ===
        this.dateKey(date)

    );

  }


  /*
    ========================================
    GET ENTRY
    ========================================
  */

  getEntry(
    date: Date
  ): DiaryEntry | undefined {


    return this.diaryEntries.find(

      entry =>

        entry.date ===
        this.dateKey(date)

    );

  }
  ismarkon = false;
 onClickPreview(event: Event){
this.ismarkon = true;

}
}
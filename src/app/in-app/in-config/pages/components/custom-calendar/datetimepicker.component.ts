import { Component, OnInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { L10N_PREFIX } from '@progress/kendo-angular-l10n';
import { IntlService, CldrIntlService } from '@progress/kendo-angular-intl';

@Component({
  selector: 'app-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true
    },
    { provide: L10N_PREFIX, useValue: 'kendo.calendar' }
  ]
})
export class DateTimePickerComponent implements OnInit, ControlValueAccessor {
  @ViewChild('timeDropdown') timeDropdown: any;
  minDate = new Date();
  dateOnlyValue = new Date();
  dateTimeValue = new Date();
  allDay = false;
  timeList: Date[] = [];
  displayedTimeList: Date[] = [];
  selectedTime: Date | null = null;
  isAM = true;
  previousTime: Date | null = null;

  private onChange: (val: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  /**
   * Khởi tạo component, thiết lập locale cho Kendo nếu cần.
   * @param intlService Dịch vụ nội bộ của Kendo (thiết lập ngôn ngữ).
   */
  constructor(private intlService: IntlService) {}

  /**
   * Thiết lập locale='vi' (nếu dùng CldrIntlService).
   * Tạo danh sách timeList gồm 48 mốc giờ (mỗi 30 phút).
   */
  ngOnInit(): void {
    if (this.intlService instanceof CldrIntlService) {
      (this.intlService as CldrIntlService).localeId = 'vi';
    }
    const base = new Date(0, 0, 1, 0, 0, 0);
    for (let i = 0; i < 48; i++) {
      this.timeList.push(new Date(base.getTime()));
      base.setMinutes(base.getMinutes() + 30);
    }
    this.filterTimeList();
  }

  /**
   * Hàm disable các ngày trước hôm nay (trả về true nếu bị disable).
   */
  disabledDates = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  /**
   * Xử lý khi chọn/bỏ chọn "Cả ngày".
   * - Nếu chọn: lưu giờ cũ, đặt giờ = 00:00, đóng dropdown.
   * - Nếu bỏ: khôi phục giờ cũ (nếu có).
   */
  onAllDayChange(): void {
    if (this.allDay) {
      this.previousTime = this.selectedTime;
      if (this.timeDropdown) this.timeDropdown.toggle(false);
      const d = this.dateTimeValue;
      this.dateTimeValue = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      this.selectedTime = null;
    } else {
      if (this.previousTime) {
        this.selectedTime = this.previousTime;
        this.combineDateAndTime(this.previousTime);
      } else {
        const d = this.dateTimeValue;
        const fallback = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
        this.selectedTime = fallback;
        this.combineDateAndTime(fallback);
      }
    }
    this.onChange(this.dateTimeValue);
    this.onTouched();
  }

  /** Đặt chế độ AM rồi lọc lại danh sách giờ. */
  setAM(): void {
    if (!this.isAM && this.selectedTime) {
      const h = this.selectedTime.getHours();
      if (h >= 12) {
        const newTime = new Date(this.selectedTime);
        newTime.setHours(h - 12);
        this.selectedTime = newTime;
        this.combineDateAndTime(newTime);
      }
    }
    this.isAM = true;
    this.filterTimeList();
  }

  /** Đặt chế độ PM rồi lọc lại danh sách giờ. */
  setPM(): void {
    if (this.isAM && this.selectedTime) {
      const h = this.selectedTime.getHours();
      if (h < 12) {
        const newTime = new Date(this.selectedTime);
        newTime.setHours(h + 12);
        this.selectedTime = newTime;
        this.combineDateAndTime(newTime);
      }
    }
    this.isAM = false;
    this.filterTimeList();
  }

  /**
   * Lọc danh sách timeList theo AM/PM => hiển thị vào displayedTimeList.
   * Nếu selectedTime không còn hợp lệ, reset nó.
   */
  private filterTimeList(): void {
    this.displayedTimeList = this.isAM
      ? this.timeList.filter(t => t.getHours() < 12)
      : this.timeList.filter(t => t.getHours() >= 12);

    if (
      this.selectedTime &&
      ((this.isAM && this.selectedTime.getHours() >= 12) ||
        (!this.isAM && this.selectedTime.getHours() < 12))
    ) {
      this.selectedTime = null;
    }
    if (!this.selectedTime && this.displayedTimeList.length) {
      this.selectedTime = this.displayedTimeList[0];
      this.combineDateAndTime(this.selectedTime);
    }
  }

  /**
   * Khi dropdown thay đổi giờ => gộp giờ mới vào dateTimeValue.
   * @param value Mốc giờ mới được chọn.
   */
  onTimeDropdownChange(value: Date): void {
    this.selectedTime = value;
    this.combineDateAndTime(value);
  }

  /**
   * Gộp giờ từ `time` vào ngày cũ (dateTimeValue) => cập nhật dateTimeValue.
   */
  private combineDateAndTime(time: Date): void {
    const old = this.dateTimeValue || new Date();
    this.dateTimeValue = new Date(
      old.getFullYear(),
      old.getMonth(),
      old.getDate(),
      time.getHours(),
      time.getMinutes(),
      0
    );
    this.onChange(this.dateTimeValue);
    this.onTouched();
  }

  /**
   * Khi DatePicker (thứ 2) thay đổi ngày => giữ nguyên giờ cũ.
   * @param date Ngày mới (được chọn).
   */
  onDateTimeChange(date: Date): void {
    const oldH = this.dateTimeValue.getHours();
    const oldM = this.dateTimeValue.getMinutes();
    this.dateTimeValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), oldH, oldM, 0);
    this.onChange(this.dateTimeValue);
    this.onTouched();
  }

  /**
   * Lấy nhãn hiển thị cho view thập kỷ (ví dụ: "2020 - 2029").
   * @param date Biến date do Kendo truyền vào (Date hoặc string).
   */
  public getDecadeLabel(date: any): string {
    if (date instanceof Date) {
      const y = date.getFullYear();
      const start = Math.floor(y / 10) * 10;
      return `${start} - ${start + 9}`;
    }
    if (typeof date === 'string') {
      const y = parseInt(date, 10);
      if (!isNaN(y)) {
        const start = Math.floor(y / 10) * 10;
        return `${start} - ${start + 9}`;
      }
    }
    return '';
  }

  /**
   * Lấy nhãn hiển thị cho view thế kỷ (ví dụ: "2000 - 2090").
   * @param date Biến date do Kendo truyền vào (Date hoặc string).
   */
  public getCenturyLabel(date: any): string {
    if (date instanceof Date) {
      const y = date.getFullYear();
      const start = Math.floor(y / 100) * 100;
      return `${start} - ${start + 90}`;
    }
    if (typeof date === 'string') {
      const y = parseInt(date, 10);
      if (!isNaN(y)) {
        const start = Math.floor(y / 100) * 100;
        return `${start} - ${start + 90}`;
      }
    }
    return '';
  }

  /**
   * ControlValueAccessor: Gán giá trị từ formControl vào component.
   * @param value Giá trị Date hoặc null.
   */
  writeValue(value: Date | null): void {
    if (value) {
      this.dateTimeValue = value;
      this.isAM = value.getHours() < 12;
      this.filterTimeList();
      const found = this.displayedTimeList.find(
        t => t.getHours() === value.getHours() && t.getMinutes() === value.getMinutes()
      );
      this.selectedTime = found || null;
    }
  }

  /** ControlValueAccessor: Đăng ký callback onChange. */
  registerOnChange(fn: (val: Date | null) => void): void {
    this.onChange = fn;
  }

  /** ControlValueAccessor: Đăng ký callback onTouched. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /** ControlValueAccessor: Khi muốn disable component (tạm không dùng). */
  setDisabledState?(isDisabled: boolean): void {}

  /**
   * Các hàm log khi DatePicker mở/đóng/focus/blur (nếu cần).
   */
  onOpen(source: string): void {
    console.log(`${source} opened`);
  }
  onClose(source: string): void {
    console.log(`${source} closed`);
  }
  onFocus(source: string): void {
    console.log(`${source} focused`);
  }
  onBlur(source: string): void {
    console.log(`${source} blurred`);
  }
}

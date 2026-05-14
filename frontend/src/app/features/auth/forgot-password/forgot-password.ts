import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
  tcNo: string = '';
  email: string = '';
  isSubmitted: boolean = false;

  get isTcNoValid(): boolean {
    return /^[0-9]{11}$/.test(this.tcNo);
  }

  get isEmailValid(): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email);
  }

  get isFormValid(): boolean {
    return this.isTcNoValid && this.isEmailValid;
  }

  onTcInput(event: any) {
    const val = event.target.value.replace(/[^0-9]/g, '').slice(0, 11);
    this.tcNo = val;
    event.target.value = val;
  }

  onSubmit() {
    if (this.isFormValid) {
      this.isSubmitted = true;
    }
  }
}

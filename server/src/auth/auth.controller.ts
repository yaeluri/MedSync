import { Body, Controller, Post } from '@nestjs/common';
import {
  AuthService,
  LoginInput,
  RegisterDoctorInput,
  RegisterPatientInput,
} from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register/patient')
  registerPatient(@Body() body: RegisterPatientInput) {
    return this.service.registerPatient(body);
  }

  @Post('register/doctor')
  registerDoctor(@Body() body: RegisterDoctorInput) {
    return this.service.registerDoctor(body);
  }

  @Post('login')
  login(@Body() body: LoginInput) {
    return this.service.login(body);
  }
}

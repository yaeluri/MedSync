import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  AuthService,
  LoginInput,
  RegisterDoctorInput,
  RegisterPatientInput,
} from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('register/patient')
  registerPatient(@Body() body: RegisterPatientInput) {
    return this.service.registerPatient(body);
  }

  @Public()
  @Post('register/doctor')
  registerDoctor(@Body() body: RegisterDoctorInput) {
    return this.service.registerDoctor(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: LoginInput) {
    return this.service.login(body);
  }

  /** Returns the authenticated user's session info (role, ids). */
  @Get('me')
  me(@Req() req: any) {
    const user = req.user;
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: req.userRole,
      patientId: user.patient?.id,
      caregiverId: user.caregiver?.id,
    };
  }
}

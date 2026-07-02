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

  @Public()
  @Post('refresh')
  refresh(@Body() body: { refreshToken?: string }) {
    return this.service.refresh(body?.refreshToken ?? '');
  }

  /** Returns the authenticated user's session info (role, ids). */
  @Get('me')
  me(@Req() req: any) {
    const user = req.user;
    const role = req.userRole;
    return {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role,
      // Expose only the id that matches the user's role, so clients never
      // attempt role-restricted lookups (e.g. /api/caregivers/:id) for the wrong role.
      patientId: role === 'patient' ? user.patient?.id : undefined,
      caregiverId: role === 'doctor' ? user.caregiver?.id : undefined,
    };
  }
}

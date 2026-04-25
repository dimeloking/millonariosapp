"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ClerkFormError = {
  code?: string;
  longMessage?: string;
  message?: string;
};

type AuthStep = "password" | "verification";
type VerificationStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

function getSignInErrorMessage(error: ClerkFormError | undefined) {
  const clerkMessage = `${error?.longMessage ?? ""} ${error?.message ?? ""}`.toLowerCase().trim();

  switch (error?.code) {
    case "form_identifier_not_found":
      return "No existe un usuario con este correo en Clerk.";
    case "form_password_incorrect":
    case "form_password_or_identifier_incorrect":
      return "Correo o contraseña incorrectos. Revisa la contraseña guardada en Clerk.";
    case "form_param_format_invalid":
      return "Revisa el formato del correo electrónico.";
    case "form_code_incorrect":
      return "El código no es correcto. Revisa el código enviado por Clerk.";
    default:
      if (
        clerkMessage.includes("password is incorrect") ||
        clerkMessage.includes("incorrect password")
      ) {
        return "La contraseña es incorrecta. Revisa la contraseña guardada en Clerk o restablécela.";
      }

      return error?.longMessage ?? error?.message ?? "No se pudo iniciar sesión.";
  }
}

function getStatusMessage(status: string) {
  switch (status) {
    case "needs_second_factor":
      return "Esta cuenta requiere un segundo factor de verificación.";
    case "needs_client_trust":
      return "Clerk requiere verificar este dispositivo antes de entrar.";
    case "needs_new_password":
      return "Esta cuenta requiere crear una contraseña nueva desde Clerk.";
    case "needs_first_factor":
      return "Clerk no aceptó la contraseña para esta cuenta.";
    default:
      return "Tu cuenta requiere un paso adicional de verificación.";
  }
}

function getVerificationCopy(strategy: VerificationStrategy | null) {
  switch (strategy) {
    case "email_code":
      return "Ingresa el código que Clerk envió al correo de la cuenta.";
    case "phone_code":
      return "Ingresa el código que Clerk envió al teléfono de la cuenta.";
    case "totp":
      return "Ingresa el código de tu app autenticadora.";
    case "backup_code":
      return "Ingresa un código de respaldo de Clerk.";
    default:
      return "Ingresa el código de verificación para continuar.";
  }
}

export function SignInForm() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { fetchStatus, signIn } = useSignIn();
  const [authStep, setAuthStep] = useState<AuthStep>("password");
  const [verificationStrategy, setVerificationStrategy] = useState<VerificationStrategy | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, router]);

  const finalizeSignIn = async () => {
    if (!signIn) return false;

    const finalizeResult = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl("/dashboard");

        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.replace(url);
        }
      },
    });

    if (finalizeResult.error) {
      setError(getSignInErrorMessage(finalizeResult.error));
      return false;
    }

    return true;
  };

  const startVerificationStep = async () => {
    if (!signIn) return;

    const secondFactors = signIn.supportedSecondFactors;
    const hasEmailCode = secondFactors.some((factor) => factor.strategy === "email_code");
    const hasPhoneCode = secondFactors.some((factor) => factor.strategy === "phone_code");
    const hasTotp = secondFactors.some((factor) => factor.strategy === "totp");
    const hasBackupCode = secondFactors.some((factor) => factor.strategy === "backup_code");

    if (hasEmailCode) {
      const result = await signIn.mfa.sendEmailCode();

      if (result.error) {
        setError(getSignInErrorMessage(result.error));
        return;
      }

      setVerificationStrategy("email_code");
      setAuthStep("verification");
      setCode("");
      return;
    }

    if (hasPhoneCode) {
      const result = await signIn.mfa.sendPhoneCode();

      if (result.error) {
        setError(getSignInErrorMessage(result.error));
        return;
      }

      setVerificationStrategy("phone_code");
      setAuthStep("verification");
      setCode("");
      return;
    }

    if (hasTotp) {
      setVerificationStrategy("totp");
      setAuthStep("verification");
      setCode("");
      return;
    }

    if (hasBackupCode) {
      setVerificationStrategy("backup_code");
      setAuthStep("verification");
      setCode("");
      return;
    }

    setError("Clerk requiere un segundo factor que este formulario no puede verificar todavía.");
  };

  const handlePasswordSubmit = async () => {
    if (!signIn) return;

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Escribe el correo electrónico del usuario creado en Clerk.");
      return;
    }

    if (!password) {
      setError("Escribe la contraseña real del usuario creado en Clerk.");
      return;
    }

    setError("");

    try {
      const result = await signIn.password({
        identifier: normalizedEmail,
        password,
      });

      if (result.error) {
        setError(getSignInErrorMessage(result.error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        await startVerificationStep();
        return;
      }

      setError(getStatusMessage(signIn.status));
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(getSignInErrorMessage(err.errors[0]));
      } else {
        setError("No se pudo iniciar sesión.");
      }
    }
  };

  const handleVerificationSubmit = async () => {
    if (!signIn || !verificationStrategy) return;

    const verificationCode = code.trim();

    if (!verificationCode) {
      setError("Escribe el código de verificación.");
      return;
    }

    setError("");

    try {
      const result =
        verificationStrategy === "email_code"
          ? await signIn.mfa.verifyEmailCode({ code: verificationCode })
          : verificationStrategy === "phone_code"
            ? await signIn.mfa.verifyPhoneCode({ code: verificationCode })
            : verificationStrategy === "totp"
              ? await signIn.mfa.verifyTOTP({ code: verificationCode })
              : await signIn.mfa.verifyBackupCode({ code: verificationCode });

      if (result.error) {
        setError(getSignInErrorMessage(result.error));
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      setError(getStatusMessage(signIn.status));
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(getSignInErrorMessage(err.errors[0]));
      } else {
        setError("No se pudo verificar el código.");
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (authStep === "verification") {
        await handleVerificationSubmit();
      } else {
        await handlePasswordSubmit();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn || !verificationStrategy) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result =
        verificationStrategy === "email_code"
          ? await signIn.mfa.sendEmailCode()
          : verificationStrategy === "phone_code"
            ? await signIn.mfa.sendPhoneCode()
            : null;

      if (result?.error) {
        setError(getSignInErrorMessage(result.error));
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(getSignInErrorMessage(err.errors[0]));
      } else {
        setError("No se pudo reenviar el código.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPasswordStep = () => {
    setAuthStep("password");
    setVerificationStrategy(null);
    setCode("");
    setError("");
  };

  const isBusy = fetchStatus === "fetching" || isSubmitting;

  return (
    <form className="login-form" noValidate onSubmit={handleSubmit}>
      <h2>Bienvenida de nuevo</h2>
      <p className="sub">
        {authStep === "verification"
          ? getVerificationCopy(verificationStrategy)
          : "Ingresa con tu correo y contraseña para continuar."}
      </p>

      {authStep === "password" ? (
        <>
          <div className="field">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="ctrl">
              <Mail size={15} aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <Label htmlFor="password">Contraseña</Label>
            <div className="ctrl">
              <Lock size={15} aria-hidden="true" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button
                variant="ghost"
                size="icon"
                className="login-eye"
                type="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </Button>
            </div>
          </div>

          <div className="login-options">
            <Label className="login-remember" htmlFor="remember-session">
              <Checkbox
                id="remember-session"
                className="login-checkbox"
                checked={rememberSession}
                onCheckedChange={(checked) => setRememberSession(checked === true)}
              />
              Mantener sesión
            </Label>
            <button className="login-forgot" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="field">
            <Label htmlFor="verification-code">Código de verificación</Label>
            <div className="ctrl">
              <ShieldCheck size={15} aria-hidden="true" />
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-options">
            <button className="login-forgot" type="button" onClick={resetPasswordStep}>
              Cambiar correo
            </button>
            {(verificationStrategy === "email_code" || verificationStrategy === "phone_code") && (
              <button
                className="login-forgot"
                type="button"
                disabled={isBusy}
                onClick={handleResendCode}
              >
                Reenviar código
              </button>
            )}
          </div>
        </>
      )}

      {error && (
        <p className="login-error" role="alert">
          {error}
        </p>
      )}

      <Button className="login-submit" type="submit" disabled={!signIn || isBusy}>
        {isSubmitting ? (
          <>
            Validando <Loader2 size={14} className="login-spin" />
          </>
        ) : (
          <>
            {authStep === "verification" ? "Verificar" : "Entrar"} <ArrowRight size={14} />
          </>
        )}
      </Button>

      <div className="login-meta">Protegido con cifrado de extremo a extremo · v1.0</div>
    </form>
  );
}

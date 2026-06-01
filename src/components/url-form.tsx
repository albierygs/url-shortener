import useCreateShort from "@/hooks/use-create-short";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import ShortLinkResult from "./short-link-result";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";

const formSchema = z.object({
  url: z.url("Deve ser uma url válida.").nonoptional("A url é obrigatória.")
});

type FormSchemaData = z.infer<typeof formSchema>;

const UrlForm = () => {
  const { setFullLink, setShortLink, error, setError, loading, shortLink } = useCreateShort();

  const form = useForm<FormSchemaData>({
    mode: "onSubmit",
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" }
  });

  useEffect(() => {
    if (error) {
      form.setError(
        "url",
        { message: "Tivemos um problema ao gerar seu link, tente novamente!" },
        { shouldFocus: true }
      );
    }
  });

  const onSubmit = (data: FormSchemaData) => {
    console.log(data);
    setFullLink(data.url);
  };

  const handleReset = () => {
    form.reset();
    form.clearErrors("url");
    setError(null);
    setFullLink(null);
    setShortLink(null);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Encurtar link</CardTitle>
        <CardDescription className="text-sm">Insira um link válido para encurtá-lo</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="url-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          <Controller
            name="url"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <label htmlFor="url-input" className="text-sm font-medium text-foreground">
                  Link
                </label>
                <Input
                  {...field}
                  id="url-input"
                  aria-invalid={fieldState.invalid}
                  placeholder="https://exemplo.com/link-longo"
                  className={
                    fieldState.invalid ? "border-destructive focus-visible:ring-destructive" : ""
                  }
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        </form>

        {/* Card do resultado — aparece após a geração */}
        {shortLink && <ShortLinkResult shortUrl={shortLink} />}
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="hover:cursor-pointer"
          onClick={() => handleReset()}
        >
          Limpar
        </Button>
        <Button
          type="submit"
          form="url-form"
          size="sm"
          className="gap-1.5 hover:cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              Encurtando
              <Spinner data-icon="inline-start" />
            </>
          ) : (
            <>
              Encurtar
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UrlForm;

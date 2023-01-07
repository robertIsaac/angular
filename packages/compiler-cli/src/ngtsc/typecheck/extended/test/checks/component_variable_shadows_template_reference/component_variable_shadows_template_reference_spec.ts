/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {factory as componentVariableShadowsTemplateReference} from '../../../checks/component_variable_shadows_template_reference';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('TemplateChecks', () => {
    it('binds the error code to its extended template diagnostic name', () => {
      expect(componentVariableShadowsTemplateReference.code)
          .toBe(ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE);
      expect(componentVariableShadowsTemplateReference.name)
          .toBe(ExtendedTemplateDiagnosticName.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE);
    });

    it('should produce component variable shadow template reference warning', () => {
      const fileName = absoluteFrom('/main.ts');
      const {program, templateTypeChecker} = setup([{
        fileName,
        templates: {
          'TestCmp': '<div #var1> </div> <div #var2> </div>',
        },
        source: `export class TestCmp { var3 = 'text'; var2: string = 'text'; }`
      }]);
      const sf = getSourceFileOrError(program, fileName);
      const component = getClass(sf, 'TestCmp');
      const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
          templateTypeChecker, program.getTypeChecker(),
          [componentVariableShadowsTemplateReference], {} /* options */);
      const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
      expect(diags.length).toBe(1);
      expect(diags[0].category).toBe(ts.DiagnosticCategory.Warning);
      expect(diags[0].code)
          .toBe(ngErrorCode(ErrorCode.COMPONENT_VARIABLE_SHADOWS_TEMPLATE_REFERENCE));
      expect(getSourceCodeForDiagnostic(diags[0])).toBe('#var2');
    });

    it('should not produce component variable shadow template reference warning if written correctly',
       () => {
         const fileName = absoluteFrom('/main.ts');
         const {program, templateTypeChecker} = setup([{
           fileName,
           templates: {
             'TestCmp': '<div #var1> </div> <div #var2> </div>',
           },
           source: `export class TestCmp { var3 = 'text'; var4 = 'text'; }`
         }]);
         const sf = getSourceFileOrError(program, fileName);
         const component = getClass(sf, 'TestCmp');
         const extendedTemplateChecker = new ExtendedTemplateCheckerImpl(
             templateTypeChecker, program.getTypeChecker(),
             [componentVariableShadowsTemplateReference], {} /* options */);
         const diags = extendedTemplateChecker.getDiagnosticsForComponent(component);
         expect(diags.length).toBe(0);
       });
  });
});
